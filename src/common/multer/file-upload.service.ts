import { Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';

@Controller('upload')
export class FileUploadController {

  @Post('file')
  @UseInterceptors(
    FileInterceptor('file', {
      // Multer disk storage configuration
      storage: diskStorage({
        destination: './public/uploads', // Folder to store uploaded files
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + '-' + file.originalname;
          cb(null, uniqueName);
        }
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // File size limit (10MB)
    })
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      message: 'File uploaded successfully!',
      filePath: `/uploads/${file.filename}`, // Return the file path to the user
    };
  }
}