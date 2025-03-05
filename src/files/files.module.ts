import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
// import { AwsS3StorageProvider } from '../aws-s3-storage.provider'; // Import the provider
import { ConfigModule } from '@nestjs/config';
import { AwsS3StorageProvider } from 'src/storage/aws-s3-storage.provider.tsaws-s3-storage.provider';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { FileService } from './files.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Files, FileSchema } from './files.schema';
import { FolderModule } from 'src/folder/folder.module';
import { Folder, FolderSchema } from 'src/folder/folder.schema';

@Module({
  imports: [
    JwtModule.register({
      secret: 'yourSecretKey', // You should move this to a config file or env variables
      signOptions: { expiresIn: '30d' }, // Token expiration time
    }),
       MongooseModule.forFeature([{ name: Files.name, schema: FileSchema },{ name: Folder.name, schema: FolderSchema }]),
    ConfigModule,
    UsersModule,
    FolderModule
  ], // Ensure ConfigModule is imported
  controllers: [FilesController],
  providers: [AwsS3StorageProvider,FileService], // Register the provider
  exports: [AwsS3StorageProvider], // Export it if used in another module
})
export class FilesModule {}
