
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateLocationDto {
  @IsNotEmpty()
  @IsNumber()
  lat: number;

  @IsNotEmpty()
  @IsNumber()
  lng: number;
}
