import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DriverDocument = HydratedDocument<Driver>;

@Schema({ collection: 'drivers', timestamps: true })
export class Driver {
  @Prop({ required: true })
  userId: string;

  @Prop({
    required: true,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  })
  status: string;

  @Prop({ required: true })
  vehicleType: string;

  @Prop({ required: true })
  licensePlate: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  rejectionReason: string;
}

export const DriverSchema = SchemaFactory.createForClass(Driver);
