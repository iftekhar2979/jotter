import { Type } from 'class-transformer';
import { InjectModel } from '@nestjs/mongoose';
import { Files } from '../files.schema';
import mongoose, { Model, ObjectId } from 'mongoose';

class FileLock {
  constructor(
    @InjectModel(Files.name) private readonly fileModel: Model<Files>,
  ) {}
  async copyFile({ userId, fileId }: { userId: string; fileId: string }) {
    const file = await this.fileModel.findOne({
      fileId: new mongoose.Types.ObjectId(fileId),
      userId: new mongoose.Types.ObjectId(userId),
    });
   
}
}
