
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Category } from './category.schema';

@Schema()
export class MenuItemImage {
  @Prop({ required: true })
  url: string;

  @Prop({ default: false })
  is_primary: boolean;
}
const MenuItemImageSchema = SchemaFactory.createForClass(MenuItemImage);

@Schema({ timestamps: true })
export class MenuItem extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurant_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  category_id: Category;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: true })
  is_available: boolean;

  @Prop({ type: [MenuItemImageSchema], default: [] })
  images: MenuItemImage[];
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);
