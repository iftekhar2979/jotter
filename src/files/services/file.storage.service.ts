import { FileService } from './../files.service';
import { BadRequestException, HttpException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Files } from '../files.schema';
import mongoose, { Model, ObjectId } from 'mongoose';
import { pagination } from 'src/common/pagination/pagination';

export class FileStorage {
  constructor(
    @InjectModel(Files.name) private readonly fileModel: Model<Files>,
    private readonly fileService: FileService,
  ) {}

  async renameFile({
    userId,
    fileId,
    fileName,
  }: {
    userId: string;
    fileId: ObjectId;
    fileName: string;
  }) {
    const file = await this.fileModel.findOne(fileId);
    if (!file) {
      throw new BadRequestException('File not found!');
    }
    if (file.userId.toString() !== userId) {
      throw new BadRequestException('File not accessible!');
    }
    file.fileName = fileName;
    await file.save();
    // console.log("Renamed Successfully ",file)
    return { message: 'Renamed Successfully', data: file };
  }
  async filterFile({
    userId,
    type,
    name,
    limit = 10,
    page = 1,
  }: {
    userId: ObjectId;
    type: 'image' | 'pdf' | 'text';
    name: string;
    limit: number;
    page: number;
  }) {
    let query: any = {
      userId,
    };

    // Only apply regex filters if `name` or `type` is provided
    if (name) {
      query.fileName = { $regex: name, $options: 'i' };
    }

    if (type) {
      query.mimetype = { $regex: type, $options: 'i' };
    }

    // Log the query to debug
    console.log(query);

    const file = await this.fileModel
      .find(query)
      .skip(limit * (page - 1))
      .limit(limit)

    const count = await this.fileModel.countDocuments(query);
    if (!file) {
      throw new HttpException('No file found', 404);
    }
    return {
      message: 'File retrived successfully!',
      data: file,
      pagination: pagination(limit, page, count),
    };
  }
  async deleteFile({ userId, fileId }: { userId: string; fileId: ObjectId }) {
    const file = await this.fileModel.findOne(fileId);
    if (!file) {
      throw new HttpException('File not found!', 404);
    }
    if (file.userId.toString() !== userId) {
      throw new BadRequestException('File is not accessible!');
    }
    await this.fileService.updateStorage({
      userId: new mongoose.Types.ObjectId(userId) as unknown as ObjectId,
      size: parseFloat((file.size / (1024 * 1024)).toFixed(2)),
      option: 'decrement',
    });

    return {
      message: 'File removed',
      data: await this.fileModel.deleteOne(fileId),
    };
  }
}
