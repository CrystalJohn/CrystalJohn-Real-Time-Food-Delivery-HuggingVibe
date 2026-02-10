
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';

@Schema()
export class Staff extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user_id: User;

  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurant_id: Types.ObjectId;

  @Prop({ default: true })
  is_active: boolean;
}

export const StaffSchema = SchemaFactory.createForClass(Staff);
