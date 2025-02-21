import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { User, UserSchema } from 'src/users/users.schema';
import { MongooseModule } from '@nestjs/mongoose';
// import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from 'src/users/users.service';
import { Otp, OtpSchema } from './otp.schema';
// import { EmailService } from 'src/common/mailer/sendMail';
import { EmailserviceModule } from 'src/emailservice/emailservice.module';
import { Reflector } from '@nestjs/core';
import { Profile, ProfileSchema } from 'src/profile/profile.schema';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }]),
    MongooseModule.forFeature([{ name: Profile.name, schema: ProfileSchema }]),

    JwtModule.register({
      secret: 'yourSecretKey', // You should move this to a config file or env variables
      signOptions: { expiresIn: '30d' }, // Token expiration time
    }),
    UsersModule,
    EmailserviceModule,
    Reflector,  // Register Reflector for metadata reflection
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
