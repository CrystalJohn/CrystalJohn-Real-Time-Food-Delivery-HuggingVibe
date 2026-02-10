
import { IsNotEmpty, IsString } from 'class-validator';
import { OrderStatus } from '../../../shared/enums/order-status.enum';

export class UpdateStatusDto {
  @IsNotEmpty()
  @IsString()
  status: OrderStatus;
}
