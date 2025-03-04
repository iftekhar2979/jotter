import { Test, TestingModule } from '@nestjs/testing';
// import { AwsS3StorageProvider } from './aws-s3-storage.provider';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { AwsS3StorageProvider } from './storage/aws-s3-storage.provider.tsaws-s3-storage.provider';

// Mock AWS SDK globally
jest.mock('aws-sdk', () => {
  return {
    S3: jest.fn(() => ({
      listBuckets: jest.fn().mockImplementation((callback) => 
        callback(null, { Buckets: [{ Name: 'jotter' }] })
      ),
      upload: jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue({
          Location: 'http://localhost:9000/jotter/test-file.txt',
        }),
      }),
    })),
  };
});

describe('AwsS3StorageProvider', () => {
  let storageProvider: AwsS3StorageProvider;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AwsS3StorageProvider,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const mockConfig = {
                AWS_ACCESS_KEY_ID: 'admin',
                AWS_SECRET_ACCESS_KEY: 'password',
                AWS_ENDPOINT: 'http://localhost:9000',
                AWS_S3_BUCKET_NAME: 'jotter',
              };
              return mockConfig[key];
            }),
          },
        },
      ],
    }).compile();

    storageProvider = module.get<AwsS3StorageProvider>(AwsS3StorageProvider);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should initialize S3 with correct credentials', () => {
    const s3 = new AWS.S3({
      accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      endpoint: configService.get<string>('AWS_ENDPOINT'),
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
    });

    expect(s3).toBeDefined();
    expect(AWS.S3).toHaveBeenCalledTimes(1);
    expect(AWS.S3).toHaveBeenCalledWith({
      accessKeyId: 'admin',
      secretAccessKey: 'password',
      endpoint: 'http://localhost:9000',
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
    });
  });
});
