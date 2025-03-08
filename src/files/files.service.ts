import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
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
  async uploadMultipleFiles(files, userId: ObjectId, folderId: ObjectId) {
    if (!files || files.length === 0)
      throw new BadRequestException('No files uploaded');

    const fileDocuments = files.map((file) => ({
      userId,
      fileName: file.originalname,
      size: file.size,
      url: file.location.split('/').slice(3, 5).join('/'),
      mimetype: file.mimetype,
      folder: folderId,
    }));

    if (folderId) {
      const folderExist = await this.folderModel.findById(folderId);
      if (!folderExist) throw new NotFoundException('Folder not found');
    }

    return await this.fileModel.insertMany(fileDocuments);
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
      data: await this.uploadMultipleFiles(file, user, folder),
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
    date,
    enddate,
    sort = 'desc',
    sortedby = 'date',
  }: {
    userId?: ObjectId;
    folder?: ObjectId | null;
    name?: string;
    limit?: number;
    page?: number;
    date?: string;
    enddate?:string;
    sort?: 'asc' | 'desc';
    sortedby?: 'date' | 'size';
  }): Promise<any> {
    const matchQuery: any = { ownerId: userId };

    if (folder) {
      matchQuery.parentFolderId = folder.toString();
    } else {
      matchQuery.parentFolderId = null; // Fetch root-level folders
    }
    if (name) {
      matchQuery.name = { $regex: new RegExp(name, 'i') }; // Case-insensitive search
    }
    if (date) {
      const endDate = new Date(date); 
      endDate.setHours(23, 59, 59, 999); 
      matchQuery.createdAt = { $lte: endDate };
    }
    // if (enddate) {
    //   const endDate = new Date(date); 
    //   endDate.setHours(23, 59, 59, 999); 
    //   matchQuery.createdAt = { $gte: endDate };
    // }
    console.log(matchQuery)
    const aggregationPipeline: any = [
      {
        $match: matchQuery, // Match folders
      },
      {
        $unionWith: {
          coll: 'files', // Merge with 'files' collection
          pipeline: [
            {
              $match: {
                userId: userId,
                folder: folder || null,
                ...(name
                  ? { fileName: { $regex: new RegExp(name, 'i') } }
                  : {}),
              },
            },
          ],
        },
      },
      {
        $sort: { createdAt: -1 }, // Default sorting (by date, descending)
      },
      {
        $skip: (page - 1) * limit, // Pagination
      },
      {
        $limit: limit,
      },
    ];

    if (sort === 'asc' && sortedby === 'date') {
      aggregationPipeline[2].$sort = { createdAt: 1 };
    }
    if (sort === 'asc' && sortedby === 'size') {
      aggregationPipeline.splice(2, 0, { $sort: { size: 1 } }); // Apply size sorting before pagination
    }
    if (sort === 'desc' && sortedby === 'size') {
      aggregationPipeline.splice(2, 0, { $sort: { size: -1 } });
    }

    if (sort == 'asc' && sortedby === 'date') {
      aggregationPipeline[2].$sort.createdAt = 1;
    }
    if (sort == 'asc' && sortedby === 'size') {
      aggregationPipeline[1].$unionWith.pipeline[1].$sort.size = 1;
    }

    console.log(aggregationPipeline[2]);
    // Execute aggregation pipeline on `folders` collection
    const result = await this.folderModel.aggregate(aggregationPipeline);
    return result;
  }
}
