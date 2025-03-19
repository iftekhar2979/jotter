import { Module } from '@nestjs/common';
import { PinController } from './pin.controller';
import { LockService } from './pin.service';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from 'src/users/users.module';
import { Lock, LockSchema } from './pin.schema';
import { FileSchema } from 'src/files/files.schema';
// import { PinService } from './pin.service';

@Module({
  imports: [
    JwtModule.register({
      secret: 'yourSecretKey', // You should move this to a config file or env variables
      signOptions: { expiresIn: '30d' }, // Token expiration time
    }),
    MongooseModule.forFeature([
      // { name: Pin.name, schema: FileSchema },
      { name: Lock.name, schema: LockSchema },
      { name: File.name, schema: FileSchema },
    ]),
    ConfigModule,
    UsersModule,
  ],
  controllers: [PinController],
  providers: [LockService],
})
export class PinModule {}
