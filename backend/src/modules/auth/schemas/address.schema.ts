
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';

@Schema({ timestamps: true })
export class Address extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: User;

  @Prop()
  label: string;

  @Prop({ required: true })
  full_address: string;

  @Prop({ type: Number })
  lat: number;

  @Prop({ type: Number })
  lng: number;

  @Prop({ default: false })
  is_default: boolean;
}

export const AddressSchema = SchemaFactory.createForClass(Address);
