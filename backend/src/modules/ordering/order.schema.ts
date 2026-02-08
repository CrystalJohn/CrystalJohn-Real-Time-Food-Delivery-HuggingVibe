import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

@Schema({ collection: 'orders', timestamps: true })
export class Order {
  @Prop({ required: true })
  customerId: string;

  @Prop({
    required: true,
    type: [
      {
        menuItemId: { type: String, required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
      },
    ],
  })
  items: OrderItem[];

  @Prop({ required: true, type: Number })
  totalAmount: number;

  @Prop({
    required: true,
    enum: [
      'PENDING',
      'CONFIRMED',
      'PREPARING',
      'READY',
      'DELIVERING',
      'DELIVERED',
      'CANCELLED',
    ],
    default: 'PENDING',
  })
  status: string;

  @Prop({ required: true })
  deliveryAddress: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
