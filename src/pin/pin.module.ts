import { Module } from '@nestjs/common';
import { PinController } from './pin.controller';
import { LockService } from './pin.service';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from 'src/users/users.module';
import { Lock, LockSchema } from './pin.schema';
import { FileSchema } from 'src/files/files.schema';
// import { PinService } from './pin.service';

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
