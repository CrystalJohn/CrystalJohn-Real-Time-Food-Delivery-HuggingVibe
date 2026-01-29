import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ collection: 'orders', timestamps: true })
export class Order {
  @Prop({ required: true })
  customerId: string;

  @Prop({ required: true })
  restaurantId: string;

  @Prop({ required: true, type: Number })
  totalAmount: number;

  @Prop({ required: true, enum: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'PICKED_UP', 'DELIVERED', 'CANCELLED'], default: 'PENDING' })
  status: string;

  @Prop([String])
  items: string[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);
