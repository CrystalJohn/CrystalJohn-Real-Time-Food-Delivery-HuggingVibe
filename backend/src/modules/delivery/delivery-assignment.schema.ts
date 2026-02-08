import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DeliveryAssignmentDocument = HydratedDocument<DeliveryAssignment>;

@Schema({ collection: 'deliveryAssignments', timestamps: true })
export class DeliveryAssignment {
  @Prop({ required: true })
  orderId: string;

  @Prop()
  driverId: string;

  @Prop({
    required: true,
    enum: ['PENDING', 'ASSIGNED', 'PICKED_UP', 'DELIVERED'],
    default: 'PENDING',
  })
  status: string;

  @Prop({ required: true })
  pickupAddress: string;

  @Prop({ required: true })
  deliveryAddress: string;

  @Prop()
  acceptedAt: Date;

  @Prop()
  pickedUpAt: Date;

  @Prop()
  deliveredAt: Date;
}

export const DeliveryAssignmentSchema =
  SchemaFactory.createForClass(DeliveryAssignment);
