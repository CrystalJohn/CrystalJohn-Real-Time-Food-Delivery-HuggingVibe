
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @IsNotEmpty()
  @IsString()
  full_address: string;

  @IsOptional()
  @IsString()
  label: string;

  @IsOptional()
  @IsNumber()
  lat: number;

  @IsOptional()
  @IsNumber()
  lng: number;

  @IsOptional()
  is_default: boolean;
}
