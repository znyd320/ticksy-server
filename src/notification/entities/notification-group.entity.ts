import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationGroupDocument = NotificationGroup & Document;

@Schema()
export class NotificationGroup {
  @Prop({ required: true })
  groupName: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], required: true })
  userIds: Types.ObjectId[];
}

export const NotificationGroupSchema =
  SchemaFactory.createForClass(NotificationGroup);
