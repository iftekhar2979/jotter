import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_FILTER, } from '@nestjs/core';
import { ValidationExceptionFilter } from './common/filters/validationError';
import { AuthModule } from './auth/auth.module';
import { EmailserviceModule } from './emailservice/emailservice.module';
import { ProfileModule } from './profile/profile.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ChatController } from './chat/chat.controller';
import { ChatModule } from './chat/chat.module';
import { FolderModule } from './folder/folder.module';
// import { MinioService } from './minio/minio.service';
import { FilesModule } from './files/files.module';
import { StorageModule } from './storage/storage.module';
import { MetaModule } from './meta/meta.module';
import { FavouriteModule } from './favourite/favourite.module';
// import { FavourtieController } from './favourtie/favourtie.controller';
import { OcrService } from './ocr/ocr.service';
// import { OcrController } from './ocr/ocr.controller';
import { OcrModule } from './ocr/ocr.module';
import { PinModule } from './pin/pin.module';
import { SettingsModule } from './settings/settings.module';
import { SeedModule } from './seed/seed.module';
import { SeederService } from './seed/seedService';

@Module({
  imports:  [
    // Connect to MongoDB
    MongooseModule.forRoot('mongodb://localhost:27017/jotter'),
    UsersModule,
    AuthModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),  // Serve from the 'public' directory
    }),
    EmailserviceModule,
    ProfileModule,
    ChatModule,
    FolderModule,
    FilesModule,
    StorageModule,
    MetaModule,
    FavouriteModule,
    OcrModule,
    PinModule,
    SettingsModule,
    SeedModule
  ],
  controllers: [AppController, ChatController,],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter,
    },
    AppService,
    OcrService,
    
    SeederService,
    // MinioService,
  ],
})
export class AppModule {}
