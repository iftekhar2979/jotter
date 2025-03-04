import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as multerS3 from 'multer-s3';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto'

const configService = new ConfigService();
@Injectable()
export class AwsS3StorageProvider implements OnModuleInit {
  private readonly logger = new Logger(AwsS3StorageProvider.name);
  private s3: AWS.S3;
  private multerStorage: any;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');

    if (!bucketName) {
      this.logger.error('❌ AWS_S3_BUCKET_NAME is missing in .env');
      throw new Error('AWS_S3_BUCKET_NAME is required');
    }

    this.logger.log(`✅ Using bucket: ${bucketName}`);

    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || 'admin',
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || 'password',
      endpoint: this.configService.get<string>('AWS_ENDPOINT') || 'http://localhost:9000',
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
    });

    this.logger.log("✅ Initializing Multer-S3...");
    
    this.multerStorage = multerS3({
      s3: this.s3,
      bucket: bucketName,
      acl: 'private',
      metadata: (req, file, callback) => {
        this.logger.log(`📂 Metadata received: ${file.fieldname}`);
        callback(null, { fieldName: file.fieldname });
      },
      key: (req, file, callback) => {
        const uniqueFileName = `${crypto.randomBytes(20)}-${file.originalname}`;
        this.logger.log(`📂 File being saved as: ${uniqueFileName}`);
        callback(null, uniqueFileName);
      },
    });

    this.logger.log("✅ Multer-S3 storage initialized successfully.");
  }

  getMulterStorage() {
    console.log(this.multerStorage)
    // if (!this.multerStorage) {
    //   throw new Error('❌ Multer storage is not initialized yet');
    // }
    return this.multerStorage;
  }
}

// src/common/multer.config.ts



