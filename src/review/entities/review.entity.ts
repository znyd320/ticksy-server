import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Ratting } from '../../common/enum';

@Schema({ timestamps: true, versionKey: false })
export class Review extends Document {
  @Prop({ type: Types.ObjectId, ref: 'SurprisedBucket' })
  bucketId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'SurprisedBucket' })
  restaurantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Order' })
  orderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  reviewBy: Types.ObjectId;

  @Prop({ type: String })
  details: string;

  @Prop({ type: Number, enum: Ratting })
  rating: number;

  @Prop({ type: Date, default: Date.now() })
  time: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
