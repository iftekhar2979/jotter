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
  let titles = `${new Date().getTime()}-${title}`;
  const params = {
    Bucket: configService.get<string>('AWS_S3_BUCKET_NAME') || 'jotter', // Replace with your bucket name
    Key: titles,
    Body: query,
  };
  const data = await s3.upload(params).promise();
  return { fileSize, ...data, title, urlTitle: titles };
}

export async function replaceExistingFile({
  body,
  existingTitle,
  newTitle,
}: {
  body: string;
  existingTitle: string;
  newTitle: string;
}) {
  const fileSize = Buffer.byteLength(body, 'utf8');
  const params = {
    Bucket: configService.get<string>('AWS_S3_BUCKET_NAME') || 'jotter', // Replace with your bucket name
    Key: existingTitle,
    Body: body,
  };
  try {
    // Check if the file exists
    // const files = await s3.listObjectsV2({ Bucket: 'jotter' }).promise();
    // files.Contents.forEach((item) => {
    //   console.log(`Key: ${item.Key}, LastModified: ${item.LastModified}`);
    // });
    const fileExists = await s3
      .headObject({ Bucket: 'jotter', Key: existingTitle.split('/')[1] })
      .promise();

    console.log('File exists:', fileExists);

    // If file exists, delete it before uploading the new one
    let del = await s3
      .deleteObject({ Bucket: params.Bucket, Key: params.Key })
      .promise();
    console.log('File deleted successfully', del);
  } catch (error) {
    console.log(error);
    if (error.code === 'NotFound') {
      console.log('File does not exist, no need to delete');
    } else {
      console.error('Error checking for file:', error);
    }
  }

  const uploadParams = {
    Bucket: configService.get<string>('AWS_S3_BUCKET_NAME') || 'jotter',
    Key: `${new Date().getTime()}-${newTitle}`,
    Body: body,
  };

  try {
    const data = await s3.upload(uploadParams).promise();
    console.log('File uploaded successfully:', data);
    return { fileSize, ...data, title: newTitle };
  } catch (uploadError) {
    console.error('Error uploading file:', uploadError);
  }
}
