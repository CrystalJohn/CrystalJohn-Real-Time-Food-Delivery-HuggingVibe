import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type KitchenTicketDocument = HydratedDocument<KitchenTicket>;

export interface TicketItem {
  menuItemId: string;
  name: string;
  quantity: number;
}

@Schema({ collection: 'kitchenTickets', timestamps: true })
export class KitchenTicket {
  @Prop({ required: true })
  orderId: string;

  @Prop({
    required: true,
    type: [
      {
        menuItemId: { type: String, required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
      },
    ],
  })
  items: TicketItem[];

  @Prop({
    required: true,
    enum: ['PENDING', 'IN_PROGRESS', 'READY', 'REJECTED'],
    default: 'PENDING',
  })
  status: string;

  @Prop()
  staffId: string;

  @Prop()
  acceptedAt: Date;

  @Prop()
  readyAt: Date;

  @Prop()
  rejectionReason: string;
}

export const KitchenTicketSchema =
  SchemaFactory.createForClass(KitchenTicket);
