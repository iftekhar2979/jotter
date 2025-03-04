import { multerConfig, multerS3Config } from 'src/common/multer/multer.config';
import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
import { AwsS3StorageProvider } from 'src/storage/aws-s3-storage.provider.tsaws-s3-storage.provider';
//   import { AwsS3StorageProvider } from '../storage/aws-s3-storage.provider';
  
  @Controller('files')
  export class FilesController {
    constructor(private readonly s3Provider: AwsS3StorageProvider) {}
  
    @Post('upload')
    async uploadToS3(@UploadedFile() file: Express.Multer.File) {
      console.log("📂 File received:", file);
  
      const storage = this.s3Provider.getMulterStorage();
  
      if (!storage) {
        console.error("❌ Multer storage is not initialized.");
        throw new Error("Multer storage is not initialized.");
      }
//   console.log(storage.multerConfig())
      return {
        message: '✅ File uploaded to MinIO successfully',
        // fileUrl: `http://localhost:9000/jotter/${file.filename}`,
      };
    }
  
    @Post('upload-minio')
    @UseInterceptors(FileInterceptor('file',{storage:multerS3Config}))
    async uploadToMinIO(@UploadedFile() file: Express.Multer.File) {
      if (!file) {
        console.error("❌ File upload failed - file is undefined");
        return { message: '❌ File upload failed' };
      }
  console.log(file)
      return {
        message: '✅ File uploaded successfully to MinIO',
        fileUrl: `http://localhost:9000/jotter/${file.originalname}`,
      };
    }
  }
  