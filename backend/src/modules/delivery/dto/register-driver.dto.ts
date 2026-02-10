
import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterDriverDto {
  @IsNotEmpty()
  @IsString()
  vehicle_type: string;

  @IsNotEmpty()
  @IsString()
  license_plate: string;
}
