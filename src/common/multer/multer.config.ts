// src/common/multer.config.ts

import { diskStorage } from 'multer';
import { extname } from 'path';

// Multer configuration for handling file uploads
export const multerConfig = {
  storage: diskStorage({
    // Define the destination folder where files will be saved
    destination: 'public/uploads', // You can change this to any other folder you want
    // Define the naming convention for the uploaded files
    filename: (req, file, callback) => {
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
