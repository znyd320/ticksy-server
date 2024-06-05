import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { YesNo } from '../../common/enum';
import { WeekDaysWithTime } from '../interfaces/week-days.interface';

@Schema({ timestamps: true, versionKey: false })
export class SurprisedBucket extends Document {
  @Prop({ type: String, required: true, trim: true })
  bucketName: string;

  @Prop({
    type: Types.ObjectId,
    required: true,
    trim: true,
    ref: 'ProUserFinance',
  })
  proUserDetails: Types.ObjectId;

  @Prop({ type: String, trim: true })
  description: string;

  @Prop({ type: Number, required: true })
  originalPrice: number;

  @Prop({ type: Number, required: true })
  discountedPrice: number;

  @Prop({ type: [Types.ObjectId], ref: 'BucketCategory' })
  category: [Types.ObjectId];

  @Prop({ type: Number, required: true })
  numberOfBags: number;

  @Prop({ type: [Object], default: [] })
  weekDays: WeekDaysWithTime[];

  @Prop({ type: String, enum: YesNo, trim: true })
  subjectToVat: string;

  @Prop({ type: String, trim: true })
  officialLegalCompanyName: string;

  @Prop({ type: String, trim: true })
  vatNumber: string;

  @Prop({ type: String })
  bucketImages: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Boolean, default: true })
  status: boolean;
}

export const SurprisedBucketSchema =
  SchemaFactory.createForClass(SurprisedBucket);
