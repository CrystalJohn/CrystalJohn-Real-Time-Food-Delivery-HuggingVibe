
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class AddToCartDto {
  @IsNotEmpty()
  menu_item_id: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
}
