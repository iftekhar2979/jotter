import {
  Injectable,
  BadRequestException,
  NotFoundException,
  HttpException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId } from 'mongoose';
import { Express } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { Files } from './files.schema';
import { FolderService } from 'src/folder/folder.service';
import { Folder } from 'src/folder/folder.schema';
import { pagination } from 'src/common/pagination/pagination';
import { Storage } from 'src/users/users.schema';
import { OcrService } from 'src/ocr/ocr.service';
import { ConfigService } from '@nestjs/config';
import { pipeline } from 'stream';

@Injectable()
export class FileService {
  constructor(
    @InjectModel(Files.name) private readonly fileModel: Model<Files>,
    @InjectModel(Folder.name) private readonly folderModel: Model<Folder>,
    @InjectModel(Storage.name) private readonly storageModel: Model<Storage>,
    private folderService: FolderService,
    private ocrService: OcrService,
    private configService: ConfigService,
  ) {}

  getFile(fileId) {
    return this.fileModel.findById(fileId);
  }
  async updateStorage({
    userId,
    size,
    option,
  }: {
    userId: ObjectId;
    size: number;
    option: 'increment' | 'decrement';
  }): Promise<void> {
    console.log('Size:', size);

    // Ensure the size is a positive number
    if (size < 0) {
      throw new Error('Size must be a positive number');
    }

    // Prepare the update data based on the option (increment or decrement)
    const updateData =
      option === 'increment'
        ? { $inc: { used: size } }
        : { $inc: { used: -size } };

    // Perform the update on the Storage document
    await this.storageModel.findOneAndUpdate({ userId }, updateData, {
      upsert: true,
      new: true,
    });
  }
  getStorageInfo({ userId }: { userId: string }) {
    return this.storageModel.findOne({ userId }, { used: 1, total: 1 });
  }

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

    const fileDocuments = await Promise.all(
      files.map(async (file) => {
        // const fileBuffer = file.buffer;
        console.log('From Controller', file);
        let recognizedText = '';
        if (file.mimetype.includes('image')) {
          recognizedText = await this.ocrService.performOcr(
            `${this.configService.get<string>(
              'AWS_ENDPOINT',
            )}/${this.configService.get<string>('AWS_S3_BUCKET_NAME')}/${file.key}`,
          );
        }
        console.log(recognizedText);
        return {
          userId,
          fileName: file.originalname,
          size: file.size,
          url: file.location.split('/').slice(3, 5).join('/'),
          mimetype: file.mimetype,
          folder: folderId,
          recognizedText,
        };
      }),
    );

    console.log('Document', fileDocuments);

    if (folderId) {
      const folderExist = await this.folderModel.findById(folderId);
      if (!folderExist) throw new NotFoundException('Folder not found');
    }
    let totalSize = (
      files.reduce((acc, cur) => acc + cur.size, 0) /
      (1024 * 1024)
    ).toFixed(2);
    // console.log(fileDocuments);
    const [data, storage] = await Promise.all([
      this.fileModel.insertMany(fileDocuments),
      this.updateStorage({
        userId,
        size: parseFloat(totalSize),
        option: 'increment',
      }),
    ]);
    return { message: 'File uploaded successfully!', data: data };
  }

  async uploadFiles(file, userId: string, folderId: string): Promise<any> {
    let user = new mongoose.Types.ObjectId(userId) as unknown as ObjectId;
    let folder = folderId
      ? (new mongoose.Types.ObjectId(folderId) as unknown as ObjectId)
      : null;
    if (!file) throw new BadRequestException('No file uploaded');
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
    enddate?: string;
    sort?: 'asc' | 'desc';
    sortedby?: 'date' | 'size';
  }): Promise<any> {
    const matchQuery: any = { ownerId: userId };

    if (folder) {
      matchQuery.parentFolderId = folder.toString();
    } else {
      matchQuery.parentFolderId = ''; // Fetch root-level folders
    }
    if (name) {
      matchQuery.name = { $regex: new RegExp(name, 'i') };
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
                  ? {
                      $or: [
                        {
                          fileName: { $regex: new RegExp(name, 'i') },
                        },
                        {
                          recognizedText: {
                            $regex: new RegExp(
                              name.replace(/[\n\r]+/g, ' ').trim(),
                              'i',
                            ), // Remove newlines and extra spaces
                          },
                        },
                      ],
                    }
                  : {}),
              },
            },
            {
              $lookup: {
                from: 'favourites',
                localField: '_id',
                foreignField: 'fileId',
                as: 'favourite',
                pipeline: [
                  {
                    $project: {
                      id: 1,
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                from: 'locks',
                localField: '_id',
                foreignField: 'fileId',
                as: 'locked',
                pipeline: [
                  {
                    $project: {
                      id: 1,
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                isFavourite: {
                  $cond: {
                    if: { $gt: [{ $size: '$favourite' }, 0] },
                    then: true,
                    else: false,
                  },
                },
                isLocked: {
                  $cond: {
                    if: { $gt: [{ $size: '$locked' }, 0] },
                    then: true,
                    else: false,
                  },
                },
              },
            },
            {
              $match: {
                $or: [{ isLocked: false }, { isLocked: { $exists: false } }],
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
      {
        $project: {
          favourite: 0,
        },
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
    // Execute aggregation pipeline on `folders` collection
    const result = await this.folderModel.aggregate(aggregationPipeline);
    const total = await this.folderModel.aggregate([
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
                  ? {
                      $or: [
                        {
                          fileName: { $regex: new RegExp(name, 'i') },
                        },
                        {
                          recognizedText: {
                            $regex: new RegExp(
                              name.replace(/[\n\r]+/g, ' ').trim(),
                              'i',
                            ), // Remove newlines and extra spaces
                          },
                        },
                      ],
                    }
                  : {}),
              },
            },
            {
              $lookup: {
                from: 'locks',
                localField: '_id',
                foreignField: 'fileId',
                as: 'locked',
                pipeline: [
                  {
                    $project: {
                      id: 1,
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
               
                isLocked: {
                  $cond: {
                    if: { $gt: [{ $size: '$locked' }, 0] },
                    then: true,
                    else: false,
                  },
                },
              },
            },
            {
              $match: {
                $or: [{ isLocked: false }, { isLocked: { $exists: false } }],
              },
            },
          ],
        },
        
      },
      {
        $count: 'totalCount', // Count the total number of documents
      },
    ]);
    if (total.length === 0) {
      throw new HttpException('No Files Found', 404);
    }
    return {
      message: 'folder retrived successfully',
      data: result,
      pagination: pagination(limit, page, total[0].totalCount),
    };
  }

  async uploadText({
    title,
    userId,
    size = 0,
    folderId = null,
    key = '',
    fileId = '',
  }: {
    title: string;
    userId: string;
    size: number;
    folderId;
    key: string;
    fileId?: string;
  }) {
    console.log("Key",key);
    if (fileId) {
      const file = await this.fileModel.findByIdAndUpdate(fileId, {
        userId,
        fileName: title,
        size: size,
        url: `whippedcream/${key}`,
        mimetype: 'text/plain',
        folder: folderId ? new mongoose.Types.ObjectId(folderId) : null,
      });

      return {
        message: 'File updated!',
        data: file,
      };
    } else {
      const newFile = new this.fileModel({
        userId,
        fileName: title,
        size: size,
        url: `whippedcream/${key}`,
        mimetype: 'text/plain',
        folder: folderId ? new mongoose.Types.ObjectId(folderId) : null,
      });

      await newFile.save();
      return {
        message: 'File saved!',
        data: newFile,
      };
    }
  }

  async copyDocument({
    fileId = [],
    folderId = '',
    userId,
  }: {
    fileId: string[];
    folderId: string;
    userId: string;
  }) {
    console.log(folderId);
    // console.log(fileId, folderId, userId);
    const files = await this.fileModel.find({ _id: { $in: fileId }, userId });
    console.log(files);
    if (!files) throw new NotFoundException('Files not found');
    if (!folderId) {
      const copiedFiles = await Promise.all(
        files.map(async (file) => {
          const newFile = new this.fileModel({
            userId,
            fileName: file.fileName,
            size: file.size,
            url: file.url,
            mimetype: file.mimetype,
            folder: null,
          });
          return await newFile.save();
        }),
      );
      return { message: 'Files copied successfully!', data: copiedFiles };
    }
    const folder = await this.folderModel.findOne({
      _id: new mongoose.Types.ObjectId(folderId),
    });
    console.log('Folder', folder);
    if (!folder) throw new NotFoundException('Folder not found');
    const copiedFiles = await Promise.all(
      files.map(async (file) => {
        const newFile = new this.fileModel({
          userId,
          fileName: file.fileName,
          size: file.size,
          url: file.url,
          mimetype: file.mimetype,
          folder: folderId,
        });
        return await newFile.save();
      }),
    );
    return { message: 'Files copied successfully!', data: copiedFiles };
  }
}
