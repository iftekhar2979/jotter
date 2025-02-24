
import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserDto {
  @IsString({})
  name: string;
  @IsString()
  password: string;
  @IsEmail()
  email: string;
}
