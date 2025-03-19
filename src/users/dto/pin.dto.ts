import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePin {
  @IsString()
  @MinLength(4)
  @MaxLength(4)
  pin: string;
}
export class checkPassword {
  @IsString()
  @MinLength(6)
  password: string;
}
