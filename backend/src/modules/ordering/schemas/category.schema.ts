
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Category extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurant_id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ default: 0 })
  sort_order: number;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
