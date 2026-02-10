
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';
import { Address } from './address.schema';

@Schema()
export class Customer extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user_id: User;

  @Prop({ type: Types.ObjectId, ref: 'Address' })
  default_address_id: Address;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
