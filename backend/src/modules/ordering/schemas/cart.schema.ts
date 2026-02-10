
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../auth/schemas/user.schema';
import { MenuItem } from './menu-item.schema';

export enum CartStatus {
  ACTIVE = 'ACTIVE',
  CHECKED_OUT = 'CHECKED_OUT',
}

@Schema()
export class CartItem {
  @Prop({ type: Types.ObjectId, ref: 'MenuItem', required: true })
  menu_item_id: MenuItem;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true })
  unit_price_snapshot: number;
}
const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({ timestamps: true })
export class Cart extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  customer_user_id: User;

  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurant_id: Types.ObjectId;

  @Prop({ required: true, enum: CartStatus, default: CartStatus.ACTIVE })
  status: string;

  @Prop({ type: [CartItemSchema], default: [] })
  items: CartItem[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);
