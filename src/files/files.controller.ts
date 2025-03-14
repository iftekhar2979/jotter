import { Test } from '@nestjs/testing';
import { Type } from 'class-transformer';
import mongoose, { ObjectId, Types } from 'mongoose';
import { multerConfig, multerS3Config } from 'src/common/multer/multer.config';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AwsS3StorageProvider } from 'src/storage/aws-s3-storage.provider.tsaws-s3-storage.provider';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/role-gurad';
import { Roles } from 'src/common/custom-decorator/role.decorator';
import { FileService } from './files.service';
import { FileStorage } from './services/file.storage.service';
//   import { AwsS3StorageProvider } from '../storage/aws-s3-storage.provider';

@Controller('files')
export class FilesController {
  constructor(
    private readonly s3Provider: AwsS3StorageProvider,
    private readonly fileService: FileService,
    private readonly fileStorage: FileStorage,
  ) {}

  @Patch('/rename/:fileId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  async rename(
    @Request() req,
    @Param('fileId') fileId: string,
    @Body('fileName') fileName: string,
  ) {
    return await this.fileStorage.renameFile({
      userId: req.user.id,
      fileName,
      fileId: new mongoose.Types.ObjectId(fileId) as unknown as ObjectId,
    });
  }
  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('file', 10, {
      storage: multerS3Config,
    }),
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  async uploadToMinIO(
    @Request() req,
    @Body('folderId') folderId: string,
    @UploadedFiles() file: Express.Multer.File[],
  ) {
    if (!file || file.length === 0) {
      console.error('❌ File upload failed - file is undefined');
      throw new BadRequestException('File Upload Failed');
    }
    console.log('Folder', file);
    return this.fileService.uploadFiles(file, req.user.id, folderId);
  }

  @Delete('/:fileId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  async deleteFile(@Request() req, @Param('fileId') fileId: string) {
    return await this.fileStorage.deleteFile({
      userId: req.user.id,
      fileId: new mongoose.Types.ObjectId(fileId) as unknown as ObjectId,
    });
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
    @Query('sort') sort: 'asc' | 'desc',
    @Query('date') date: string,
    @Query('enddate') enddate: string,
    @Query('sortedby') sortedby: 'date' | 'size',
  ) {
    let folderObjectId: mongoose.Types.ObjectId | undefined;
    if (folderId) {
      folderObjectId = new mongoose.Types.ObjectId(folderId);
    }
    if (page || limit) {
      page = parseFloat(page as string);
      limit = parseFloat(limit as string);
    }

    return this.fileService.getFilesAndFolders({
      userId: new mongoose.Types.ObjectId(req.user.id) as unknown as ObjectId,
      folder: folderObjectId as unknown as ObjectId,
      name,
      page,
      limit,
      date,
      enddate,
      sort,
      sortedby,
    });
  }
  @Get('/category')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  async fileFiltering(
    @Request() req,
    @Query('name') name: string,
    @Query('page') page: any,
    @Query('limit') limit: any,
    @Query('type') type: 'image' | 'pdf' | 'text',
  ) {
    if (page || limit) {
      page = parseFloat(page as string);
      limit = parseFloat(limit as string);
    }

    return this.fileStorage.filterFile({
      userId: new mongoose.Types.ObjectId(req.user.id) as unknown as ObjectId,
      name,
      page,
      limit,
      type
      // date,
      // enddate,
      // sort,
      // sortedby,
    });
  }
}
