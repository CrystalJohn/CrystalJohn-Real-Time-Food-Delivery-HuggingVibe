
import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateMenuItemDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsOptional()
  category_id: string;

  @IsOptional()
  images: { url: string; is_primary: boolean }[];
}
