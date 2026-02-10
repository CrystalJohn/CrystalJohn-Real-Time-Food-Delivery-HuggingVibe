
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  DRIVER = 'DRIVER',
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password_hash: string;

  @Prop({ required: true })
  full_name: string;

  @Prop()
  phone: string;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ type: [String], enum: UserRole, default: [UserRole.CUSTOMER] })
  roles: UserRole[];
}

export const UserSchema = SchemaFactory.createForClass(User);
