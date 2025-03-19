import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Lock, LockSchema } from './pin.schema';
import mongoose, { Model } from 'mongoose';
import { pagination } from 'src/common/pagination/pagination';

@Injectable()
export class LockService {
  constructor(
    @InjectModel(Lock.name) private lockModel: Model<Lock>,
    @InjectModel(File.name) private fileModel: Model<File>,
  ) {}

  async lockFile({ userId, fileId }: { userId: string; fileId: string }) {
    const file = await this.lockModel.findOne({
      fileId: new mongoose.Types.ObjectId(fileId),
      userId: new mongoose.Types.ObjectId(userId),
    });
    if (file) {
      await this.lockModel.deleteOne({
        fileId: new mongoose.Types.ObjectId(fileId),
        userId: new mongoose.Types.ObjectId(userId),
      });
    } else {
      await this.lockModel.create({
        fileId: new mongoose.Types.ObjectId(fileId),
        userId: new mongoose.Types.ObjectId(userId),
      });
    }
    return { message: 'File locked !', data: {} };
  }
  async getFiles({
    userId,
    searchTerm = '',
    page = 1,
    limit = 10,
  }: {
    userId: string;
    searchTerm: string;
    page: number;
    limit: number;
  }) {
    let pipline = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'files',
          localField: 'fileId',
          foreignField: '_id',
          as: 'files',
        },
      },
      {
        $unwind: '$files',
      },
      {
        $match: {
          $or: [
            { 'files.fileName': { $regex: searchTerm, $options: 'i' } },
            { 'files.recognizedText': { $regex: searchTerm, $options: 'i' } },
          ],
        },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit, 
      },
      {
        $project: {
          files: '$files',
        },
      },
    ];
    let countPipeline: any = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'files',
          localField: 'fileId',
          foreignField: '_id',
          as: 'files',
        },
      },
      {
        $unwind: '$files',
      },
      {
        $match: {
          $or: [
            { 'files.fileName': { $regex: searchTerm, $options: 'i' } },
            { 'files.recognizedText': { $regex: searchTerm, $options: 'i' } },
          ],
        },
      },
      {
        $count: 'count',
      },
    ];
    // const file = await this.lockModel.aggregate(pipline);
    const [file, count] = await Promise.all([
      this.lockModel.aggregate(pipline),
      this.lockModel.aggregate(countPipeline),
    ]);
    if (count.length === 0) {
      throw new HttpException('No file found!', 404);
    }
    return {
      message: 'File locked !',
      data: file[0],
      pagination: pagination(limit, page, count[0].count),
    };
  }
}
