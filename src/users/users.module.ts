import { Module } from '@nestjs/common';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { User, UserSchema } from './users.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { PinService } from './users.pin.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: 'yourSecretKey',
      signOptions: { expiresIn: '30d' }, 
    }),
    Reflector, 
  ],
  controllers: [UserController],
  providers: [UserService, PinService],
  exports: [UserService],
})
export class UsersModule {}
