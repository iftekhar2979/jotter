import { Module } from '@nestjs/common';
import { FolderController } from './folder.controller';
import { FolderService } from './folder.service';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Folder, FolderSchema } from './folder.schema';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports:[
    JwtModule.register({
      secret: 'yourSecretKey', // You should move this to a config file or env variables
      signOptions: { expiresIn: '30d' }, // Token expiration time
    }),
    MongooseModule.forFeature([
      {name:Folder.name,schema:FolderSchema}
    ]),
    UsersModule,

  ],
  controllers: [FolderController],
  providers: [FolderService]
})
export class FolderModule {}
