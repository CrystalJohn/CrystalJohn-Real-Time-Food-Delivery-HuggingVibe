import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MenuItemDocument = HydratedDocument<MenuItem>;

@Schema({ collection: 'menuItems', timestamps: true })
export class MenuItem {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ required: true })
  category: string;

  @Prop()
  imageUrl: string;

  @Prop({ default: true })
  available: boolean;
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);
