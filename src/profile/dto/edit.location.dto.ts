import { IsLatitude, IsLongitude, IsNumber, IsString } from 'class-validator';

export class AddLocationDto {
  @IsLatitude()
  latitude: string;
  @IsLongitude()
  longitude: string;
}
