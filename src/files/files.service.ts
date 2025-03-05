import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId } from 'mongoose';
import { Express } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { Files } from './files.schema';
import { FolderService } from 'src/folder/folder.service';
import { Folder } from 'src/folder/folder.schema';

@Injectable()
export class FileService {
  constructor(
    @InjectModel(Files.name) private readonly fileModel: Model<Files>,
    @InjectModel(Folder.name) private readonly folderModel: Model<Folder>,
    private folderService: FolderService,
  ) {}

  async uploadFile(file, userId: ObjectId, folderId: ObjectId) {
    if (!file) throw new BadRequestException('No file uploaded');
    console.log('Fp;der', folderId);
    if (folderId) {
      const folderExist = await this.folderService.getFolderByIdAndUserId({
        ownerId: userId,
        folderId: folderId,
      });
      if (!folderExist) {
        throw new BadRequestException('Folder Not Exist!');
      }
    }
    // console.log();
    const newFile = new this.fileModel({
      userId,
      fileName: file.originalname,
      size: file.size,
      url: file.location.split('/')[3] + '/' + file.location.split('/')[4],
      mimetype: file.mimetype,
      folder: folderId,
    });
    return await newFile.save();
  }
  async uploadFiles(file, userId: string, folderId: string): Promise<any> {
    let user = new mongoose.Types.ObjectId(userId) as unknown as ObjectId;

    let folder = folderId
      ? (new mongoose.Types.ObjectId(folderId) as unknown as ObjectId)
      : null;
    if (!file) throw new BadRequestException('No file uploaded');
    console.log(folder, folderId);
    return {
      message: 'File Uploaded Successfully!',
      data: await this.uploadFile(file, user, folder),
    };
  }
  getFiles({
    userId,
    folder = null,
    name,
  }: {
    userId?: ObjectId;
    folder?: ObjectId | null;
    name?: string;
  }): Promise<File[]> {
    return this.fileModel.aggregate([
      {
        $match: {
          folder,
          userId,
          name,
        },
      },
    ]);
  }
  async getFilesAndFolders({
    userId,
    folder = null,
    name,
    limit = 10,
    page = 1,
  }: {
    userId?: ObjectId;
    folder?: ObjectId | null;
    name?: string;
    limit?: number;
    page?: number;
  }): Promise<any> {
    const matchQuery: any = { ownerId: userId };

    if (folder) {
      matchQuery.parentFolderId = folder;
    } else {
      matchQuery.parentFolderId = null; // Fetch root-level folders
    }
    if (name) {
      matchQuery.name = { $regex: new RegExp(name, 'i') }; // Case-insensitive search
    }
    const aggregationPipeline: any = [
      {
        $match: matchQuery,
      },
      {
        $unionWith: {
          coll: 'files', // Join with 'files' collection
          pipeline: [
            {
              $match: {
                userId: userId,
                folder: folder || null,
                fileName: { $regex: new RegExp(name, 'i') },
              },
            },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
    ];

    // Execute aggregation pipeline on `folders` collection
    const result = await this.folderModel.aggregate(aggregationPipeline);
    return result;
  }
}
