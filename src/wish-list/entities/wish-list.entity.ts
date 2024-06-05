import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class WishList extends Document {
  @Prop({ type: Types.ObjectId, ref: 'users' })
  userInfo: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'SurprisedBucket' })
  bucket: Types.ObjectId;
}

export const WishListSchema = SchemaFactory.createForClass(WishList);
