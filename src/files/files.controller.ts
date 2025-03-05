import { Test } from '@nestjs/testing';
import { Type } from 'class-transformer';
import mongoose, { ObjectId, Types } from 'mongoose';
import { multerConfig, multerS3Config } from 'src/common/multer/multer.config';
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AwsS3StorageProvider } from 'src/storage/aws-s3-storage.provider.tsaws-s3-storage.provider';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/role-gurad';
import { Roles } from 'src/common/custom-decorator/role.decorator';
import { FileService } from './files.service';
//   import { AwsS3StorageProvider } from '../storage/aws-s3-storage.provider';

@Controller('files')
export class FilesController {
  constructor(
    private readonly s3Provider: AwsS3StorageProvider,
    private readonly fileService: FileService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage: multerS3Config }))
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  async uploadToMinIO(
    @Request() req,
    @Body('folderId') folderId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      console.error('❌ File upload failed - file is undefined');
      return { message: '❌ File upload failed' };
    }
    console.log('Folder', folderId);
    return this.fileService.uploadFiles(file, req.user.id, folderId);
  }
  @Get('')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  async files(
    @Request() req,
    @Query('folderId') folderId: string,
    @Query('name') name: string,
    @Query('page') page: any,
    @Query('limit') limit: any,
  ) {
    let folderObjectId: mongoose.Types.ObjectId | undefined;
    if (folderId) {
      folderObjectId = new mongoose.Types.ObjectId(folderId);
    }
    if(page || limit){
        page=parseFloat(page as string)
        limit=parseFloat(limit as string)
    }
    return this.fileService.getFilesAndFolders({
      userId: new mongoose.Types.ObjectId(req.user.id) as unknown as ObjectId,
      folder: folderObjectId as unknown as ObjectId,
      name,
      page,
      limit
    });
  }
}
