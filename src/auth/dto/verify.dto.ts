import { Otp } from './../otp.schema';
// src/user/dto/create-user.dto.ts
import {
  IsString,
  IsEmail,
} from 'class-validator';

export class verifyOtpDto {
  @IsEmail()
  email: string;
  @IsString()
  Otp: string;
}
