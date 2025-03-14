import * as AWS from 'aws-sdk';
import * as multerS3 from 'multer-s3';
import crypto from 'crypto'
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();
import { diskStorage } from 'multer';
import { extname } from 'path';

// Multer configuration for handling file uploads
export const multerConfig = {
  storage: diskStorage({
    // Define the destination folder where files will be saved
    destination: 'public/uploads', // You can change this to any other folder you want
    // Define the naming convention for the uploaded files
    filename: (req, file, callback) => {
      console.log('ON MULTER', file);
      // Create a unique file name based on the timestamp and random number
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      callback(
        null,
        file.fieldname + '-' + uniqueSuffix + extname(file.originalname),
      );
    },
  }),
  limits: {
    // Set file size limit (in bytes). 10 MB here.
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (req, file, callback) => {
    // Allow only image, audio, and video files
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'audio/mpeg',
      'audio/wav',
      'video/mp4',
      'video/webm',
      'video/ogg',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new Error(
          'Invalid file type. Only image, audio, and video files are allowed',
        ),
        false,
      );
    }
  },
};



// ✅ Define AWS S3 for MinIO using AWS SDK v2
export const s3 = new AWS.S3({
  accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID') || 'admin',
  secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY') || 'password',
  endpoint: configService.get<string>('AWS_ENDPOINT') || 'http://localhost:9000',
  s3ForcePathStyle: true, // Required for MinIO
  signatureVersion: 'v4',
});

// ✅ Configure Multer-S3 Storage
export const multerS3Config = multerS3({
  s3: s3, // 🔹 Pass the defined `s3` object here
  bucket: configService.get<string>('AWS_S3_BUCKET_NAME') || 'jotter',
  acl: 'private',
  metadata: (req, file, callback) => {
    console.log("📂 Metadata received:", req);
    callback(null, { fieldName: file.fieldname });
  },
  key: (req, file, callback) => {
    console.log("Body data",req.body)
    const uniqueFileName = `${Date.now()}-${file.originalname}`;
    console.log("📂 File being saved as:", uniqueFileName);
    callback(null, uniqueFileName);
  },
});
