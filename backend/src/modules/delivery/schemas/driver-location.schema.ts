
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Driver } from './driver.schema';
import { Order } from '../../ordering/schemas/order.schema';

@Schema()
export class DriverLocation extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Driver', required: true })
  driver_user_id: Driver;

  @Prop({ type: Types.ObjectId, ref: 'Order' })
  order_id: Order;

  @Prop({ required: true })
  lat: number;

  @Prop({ required: true })
  lng: number;

  @Prop()
  speed: number;

  @Prop({ default: Date.now })
  recorded_at: Date;
}

export const DriverLocationSchema = SchemaFactory.createForClass(DriverLocation);
