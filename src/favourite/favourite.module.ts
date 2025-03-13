import { Module } from '@nestjs/common';
import { FavouriteService } from './favourite.service';
import { FavouriteController } from './favourite.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Favourite, FavouriteSchema } from './favourite.schema';
import { FilesModule } from 'src/files/files.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Favourite.name, schema: FavouriteSchema },
    ]),
    FilesModule,
    JwtModule.register({
      secret: 'yourSecretKey', // You should move this to a config file or env variables
      signOptions: { expiresIn: '30d' }, // Token expiration time
    }),
  ],
  providers: [FavouriteService],
  controllers: [FavouriteController],
  exports: [FavouriteService],
})
export class FavouriteModule {}
