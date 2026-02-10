
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../auth/schemas/user.schema';

export enum DriverStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Schema({ timestamps: true })
export class Driver extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user_id: User;

  @Prop({ required: true, enum: DriverStatus, default: DriverStatus.PENDING })
  status: string;

  @Prop({ default: false })
  is_online: boolean;

  @Prop()
  vehicle_type: string;

  @Prop()
  license_plate: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approved_by: User;

  @Prop()
  approved_at: Date;
}

export const DriverSchema = SchemaFactory.createForClass(Driver);
