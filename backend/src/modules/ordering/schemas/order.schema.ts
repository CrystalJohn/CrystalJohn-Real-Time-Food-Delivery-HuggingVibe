
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../auth/schemas/user.schema';
import { Address } from '../../auth/schemas/address.schema';
import { MenuItem } from './menu-item.schema';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  ASSIGNED = 'ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  DELIVERING = 'DELIVERING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

@Schema()
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'MenuItem', required: true })
  menu_item_id: MenuItem;

  @Prop({ required: true })
  item_name_snapshot: string;

  @Prop({ required: true })
  unit_price_snapshot: number;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true })
  line_total: number;
}
const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema()
export class OrderStatusHistory {
  @Prop()
  from_status: string;

  @Prop({ required: true })
  to_status: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  changed_by_user_id: User;

  @Prop()
  reason: string;

  @Prop({ default: Date.now })
  created_at: Date;
}
const OrderStatusHistorySchema = SchemaFactory.createForClass(OrderStatusHistory);

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ required: true, unique: true })
  order_code: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  customer_user_id: User;

  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurant_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Address', required: true })
  delivery_address_id: Address;

  @Prop()
  note: string;

  @Prop({ default: 'COD' })
  payment_method: string;

  @Prop({ required: true })
  subtotal: number;

  @Prop({ required: true })
  delivery_fee: number;

  @Prop({ required: true })
  total: number;

  @Prop({ required: true, enum: OrderStatus, default: OrderStatus.PENDING })
  status: string;

  @Prop({ type: [OrderItemSchema], default: [] })
  items: OrderItem[];

  @Prop({ type: [OrderStatusHistorySchema], default: [] })
  status_history: OrderStatusHistory[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);
