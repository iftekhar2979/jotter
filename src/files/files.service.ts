import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId } from 'mongoose';
import { Express } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { Files } from './files.schema';
import { FolderService } from 'src/folder/folder.service';

@Injectable()
export class FileService {
  constructor(
    @InjectModel(Files.name) private readonly fileModel: Model<Files>,
    private folderService: FolderService,
  ) {}

  async uploadFile(file, userId: ObjectId, folderId: ObjectId): Promise<Files> {
    if (!file) throw new BadRequestException('No file uploaded');
    const folderExist = await this.folderService.getFolderByIdAndUserId({
      ownerId: userId,
      folderId: folderId,
    });
    if (!folderExist) {
      throw new BadRequestException('Folder Not Exist!');
    }
    const newFile = new this.fileModel({
      userId,
      fileName: file.originalname,
      size: file.size,
      url: file.location,
      mimetype: file.mimetype,
      folder: folderId,
    });
    return await newFile.save();
  }
  async uploadFiles(file, userId: string, folderId: string): Promise<any> {
    let user = new mongoose.Types.ObjectId(userId) as unknown as ObjectId;
    let folder = new mongoose.Types.ObjectId(userId) as unknown as ObjectId;
    if (!file) throw new BadRequestException('No file uploaded');
    if (folderId === '' || folderId === undefined) {
      throw new BadRequestException('You Need to add atLeast One Folder .');
    }
    return {
      message: 'File Uploaded Successfully!',
      data: await this.uploadFile(file, user, folder),
    };
  }
}
