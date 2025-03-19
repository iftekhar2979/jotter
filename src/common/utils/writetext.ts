import { ConfigService } from '@nestjs/config';

const fs = require('fs');
const path = require('path');

const configService = new ConfigService();
// import AWS from 'aws-sdk';
const aws = require('aws-sdk');
const s3 = new aws.S3({
  accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID') || 'admin',
  secretAccessKey:
    configService.get<string>('AWS_SECRET_ACCESS_KEY') || 'password',
  endpoint:
    configService.get<string>('AWS_ENDPOINT') || 'http://localhost:9000',
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

export async function writeTheFile(query, title) {
  const fileSize = Buffer.byteLength(query, 'utf8');
  const params = {
    Bucket: configService.get<string>('AWS_S3_BUCKET_NAME') || 'jotter', // Replace with your bucket name
    Key: title,
    Body: query,
  };
  const data = await s3.upload(params).promise();
  return { fileSize, ...data };
}
