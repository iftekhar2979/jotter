import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
// import { AwsS3StorageProvider } from '../aws-s3-storage.provider'; // Import the provider
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AwsS3StorageProvider } from 'src/storage/aws-s3-storage.provider.tsaws-s3-storage.provider';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { FileService } from './files.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Files, FileSchema } from './files.schema';
import { FolderModule } from 'src/folder/folder.module';
import { Folder, FolderSchema } from 'src/folder/folder.schema';
import { Storage, StorageSchema } from 'src/users/users.schema';
import { FileStorage } from './services/file.storage.service';
import { OcrService } from 'src/ocr/ocr.service';

@Module({
  imports: [
     JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '30d' },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Files.name, schema: FileSchema },
      { name: Folder.name, schema: FolderSchema },
      {
        name: Storage.name,
        schema: StorageSchema,
      },
    ]),
    ConfigModule,
    UsersModule,
    FolderModule,
  ], // Ensure ConfigModule is imported
  controllers: [FilesController],
  providers: [AwsS3StorageProvider, FileService, FileStorage,OcrService], // Register the provider
  exports: [AwsS3StorageProvider, FileService, FileStorage], // Export it if used in another module
})
export class FilesModule {}
