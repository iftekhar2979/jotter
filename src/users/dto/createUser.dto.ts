
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
  @IsStrongPassword({
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minLength: 6,
  }, 
  {
    message: 'Password is not strong enough!',
  }
)
  password: string;
  @IsEmail()
  email: string;
  @IsPhoneNumber()
  phone: string;

}
