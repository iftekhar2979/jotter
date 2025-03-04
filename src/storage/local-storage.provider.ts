import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import crypto from 'crypto'
import { extname } from 'path';

@Injectable()
export class LocalStorageProvider {
  getMulterStorage() {
    return diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = `${crypto.randomBytes(20)}${extname(file.originalname)}`;
        callback(null, uniqueSuffix);
      },
    });
  }
}