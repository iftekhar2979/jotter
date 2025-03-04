import * as AWS from 'aws-sdk';

const s3 = new AWS.S3({
    accessKeyId: 'admin', // MinIO Access Key
    secretAccessKey: 'password', // MinIO Secret Key
    endpoint: 'http://localhost:9000', // MinIO API
    s3ForcePathStyle: true, // Required for MinIO
    signatureVersion: 'v4', // Required for MinIO
});

const testBucket = 'test-bucket';
const testKey = 'test-file.txt';
const testBody = 'Hello MinIO!';

describe('MinIO S3 Operations', () => {
    
    it('should create a bucket', async () => {
        const params = { Bucket: testBucket };
        await s3.createBucket(params).promise();
        const buckets = await s3.listBuckets().promise();
        expect(buckets.Buckets.some(b => b.Name === testBucket)).toBe(true);
    });

    it('should upload a file to MinIO', async () => {
        const params = { Bucket: testBucket, Key: testKey, Body: testBody };
        const data = await s3.upload(params).promise();
        expect(data.Location).toContain(testBucket);
    });

    it('should retrieve the uploaded file', async () => {
        const params = { Bucket: testBucket, Key: testKey };
        const data = await s3.getObject(params).promise();
        expect(data.Body.toString()).toBe(testBody);
    });

    it('should delete the file', async () => {
        const params = { Bucket: testBucket, Key: testKey };
        await s3.deleteObject(params).promise();
        try {
            await s3.getObject(params).promise();
        } catch (err) {
            expect(err.code).toBe('NoSuchKey');
        }
    });

    it('should delete the bucket', async () => {
        const params = { Bucket: testBucket };
        await s3.deleteBucket(params).promise();
        const buckets = await s3.listBuckets().promise();
        expect(buckets.Buckets.some(b => b.Name === testBucket)).toBe(false);
    });

});
