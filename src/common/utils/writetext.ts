

// import fs from 'fs'
const {ConfigService}=require('aws-sdk')
const path=require("path")
const fs=require("fs")
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const configService = new ConfigService();
export function writeTheFile(query: string,title:string) {
    
    const filePath = path.join(__dirname,"../../../public",title); // Adjust path if needed
    // Create a write stream
    const writeStream = fs.createWriteStream(filePath);
  
    // Convert query object to a JSON string
    // const jsonData = JSON.stringify(query, null, 2); // Pretty-print with 2 spaces
  
    // Write data to stream
    writeStream.write(query);
    const params = {
        accessKeyId:'admin',
        secretAccessKey: 'password',
        endpoint: 'http://localhost:9000',
        s3ForcePathStyle: true, // Required for MinIO
        signatureVersion: 'v4',
        key:title,
        body:query
    };

    // Upload to S3
    s3.upload(params, (err, data) => {
        if (err) {
            console.error('Error uploading to S3:', err);
        } else {
            console.log(`File uploaded successfully to ${data.Location}`);
        }
    });
    // Close the stream
    writeStream.end();
  console.log(writeStream)
    writeStream.on('finish', () => {
      console.log(`Query saved to ${filePath}`);
    });
  
    writeStream.on('error', (err) => {
      console.error('Error writing query to file:', err);
    });
  }