import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
// import { AwsS3StorageProvider } from '../aws-s3-storage.provider'; // Import the provider
import { ConfigModule } from '@nestjs/config';
import { AwsS3StorageProvider } from 'src/storage/aws-s3-storage.provider.tsaws-s3-storage.provider';

@Module({
  imports: [ConfigModule], // Ensure ConfigModule is imported
  controllers: [FilesController],
  providers: [AwsS3StorageProvider], // Register the provider
  exports: [AwsS3StorageProvider], // Export it if used in another module
})
export class FilesModule {}
