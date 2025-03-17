const fs = require('fs');
const path = require('path');
// import AWS from 'aws-sdk';
const aws = require('aws-sdk');
const s3 = new aws.S3({
  accessKeyId: 'admin',
  secretAccessKey: 'password',
  endpoint: 'http://localhost:9000',
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

export async function writeTheFile(query, title) {
  const fileSize = Buffer.byteLength(query, 'utf8');
  const params = {
    Bucket: 'jotter', // Replace with your bucket name
    Key: title,
    Body: query,
  };
  const data = await s3.upload(params).promise();
  return { fileSize, ...data };
}
