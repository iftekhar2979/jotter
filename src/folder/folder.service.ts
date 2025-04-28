import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId } from 'mongoose';
import { Folder } from './folder.schema';
import { json } from 'stream/consumers';
import { s3 } from 'src/common/multer/multer.config';
import { ConfigService } from '@nestjs/config';
import { Files } from 'src/files/files.schema';

@Injectable()
export class FolderService {
  constructor(
    @InjectModel(Folder.name) private folderModel: Model<Folder>,
    @InjectModel(File.name) private fileModel: Model<File>,
    private readonly configService: ConfigService,
  ) {}

  // Create a new folder
  async createFolder(
    name: string,
    ownerId: any,
    parentFolderId: string | null = null,
  ): Promise<Folder> {
    const folderList = await this.getFoldersByOwner({
      ownerId,
      parentFolderId,
      name,
    });
    if (folderList) {
      throw new BadRequestException('Folder Already Exists');
    }

    let folder;
    if (parentFolderId) {
      // Find parent folder
      const parentFolder = await this.folderModel.findOne({
        _id: new mongoose.Types.ObjectId(parentFolderId),
      });

      if (!parentFolder) {
        throw new BadRequestException('Parent Folder Not Found');
      }

      // Create child folder with the parent's path appended
      folder = new this.folderModel({
        name,
        ownerId,
        parentFolderId,
        path: parentFolder.path + '/' + parentFolder.name, // Concatenate parent path with the new folder's name
      });
    } else {
      // Root folder with empty path
      folder = new this.folderModel({
        name,
        ownerId,
        parentFolderId, // `parentFolderId` should be `null` or `undefined` for root folders
        path: '', // Root folder has an empty path
      });
    }

    return folder.save();
  }

  // Get folders by owner
  getFoldersByOwner(query: {
    ownerId?: ObjectId;
    parentFolderId?: string | null;
    name?: string;
  }): Promise<Folder> {
    return this.folderModel.findOne(query);
  }
  getFolderByIdAndUserId(query: {
    ownerId?: ObjectId;
    folderId?: ObjectId;
  }): Promise<Folder> {
    console.log(query);
    return this.folderModel.findOne({
      ownerId: query.ownerId,
      _id: query.folderId,
    });
  }
  getAllFolders(query: {
    ownerId?: ObjectId;
    parentFolderId?: string | null;
    name?: string;
  }): Promise<Folder[]> {
    return this.folderModel.find(query);
  }
  getFilesAndFolder({
    ownerId,
    parentFolderId = null,
    name,
  }: {
    ownerId?: ObjectId;
    parentFolderId?: ObjectId | null;
    name?: string;
  }): Promise<Folder[]> {
    return this.folderModel.aggregate([
      {
        $match: {
          parentFolderId,
          ownerId,
        },
      },
    ]);
  }

  async getFolders(ownerId: ObjectId) {
    let folders = await this.getAllFolders({ ownerId });
    return { message: 'Folders Retrived Successfully!', data: folders };
  }
  // Get folder by id
  async getFolderById(id: string): Promise<Folder> {
    return this.folderModel.findById(id);
  }

  // Update a folder
  async updateFolder(id: string, name: string): Promise<Folder> {
    return this.folderModel.findByIdAndUpdate(
      id,
      { name, updatedAt: Date.now() },
      { new: true },
    );
  }

  // Delete a folder
  async deleteFolder(id: string) {
    const folders = await this.folderModel.findById(id);
    if (!folders) throw new BadRequestException('Folder Not Found');
    const fullPath = (folders.path ? folders.path : '') + '/' + folders.name;
    let nestedChilds = await this.folderModel.find({
      $or: [{ _id: folders.id }, { path: { $regex: `^${fullPath}` } }],
    });
    const nestedChildsIds = nestedChilds.map((folder) => folder._id);
    let files = (await this.fileModel.find({
      folder: { $in: nestedChildsIds },
    })) as Files[];
    const deleteParams = {
      Bucket: this.configService.get('AWS_S3_BUCKET_NAME'),
      Delete: {
        Objects: files.map((file) => ({ Key: file.url.split('/')[1] })),
        Quiet: false, // Set to true to suppress response details (optional)
      },
    };

    try {
      await Promise.all([
        await s3.deleteObjects(deleteParams).promise(),
        await await this.fileModel.deleteMany({
          folder: { $in: nestedChildsIds },
        }),
        await this.folderModel.deleteMany({
          $or: [{ _id: folders.id }, { path: { $regex: `^${fullPath}` } }],
        }),
      ]);
    } catch (error) {
      console.log(error);
    }

    return { message: 'Folder Deleted Successfully!', data: {} };
  }
}
