import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class BucketCategory extends Document {
  @Prop({ type: String, required: true })
  bucketCategoryName: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: String })
  bucketCategoryImage: string;
}

export const BucketCategorySchema =
  SchemaFactory.createForClass(BucketCategory);
