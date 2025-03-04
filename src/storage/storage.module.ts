import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { LocalStorageProvider } from './local-storage.provider';
import { AwsS3StorageProvider } from './aws-s3-storage.provider.tsaws-s3-storage.provider';
// import { AwsS3StorageProvider } from './aws-s3-storage.provider';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const storageProvider = configService.get<string>('STORAGE_PROVIDER');
        if (storageProvider === 's3') {
          const s3StorageProvider = new AwsS3StorageProvider(configService);
          return {
            storage: s3StorageProvider.getMulterStorage(),
          };
        } else {
          const localStorageProvider = new LocalStorageProvider();
          return {
            storage: localStorageProvider.getMulterStorage(),
          };
        }
      },
      inject: [ConfigService],
    }),
  ],
  providers: [LocalStorageProvider, AwsS3StorageProvider],
})
export class StorageModule {}