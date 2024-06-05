import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

class geoLocationSchema extends Document {
  @Prop({ type: String, enum: ['Point'], required: true })
  type: string;

  @Prop({ type: [Number, Number], required: true })
  coordinates: [number, number]; // [longitude, latitude]
}

@Schema({ timestamps: true, versionKey: false })
export class ProUserFinance extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  proUserDetails: Types.ObjectId;

  @Prop({ type: String, required: true })
  paymentCycle: string;

  @Prop({ type: Number, required: true })
  minimumAmount: number;

  @Prop({ type: String, required: true })
  paymentAccountType: string;

  @Prop({ type: String })
  about: string;

  @Prop({ type: String })
  paymentAccountNumber: string;

  @Prop({ type: String })
  restaurantName: string;

  @Prop({ type: String })
  address: string;

  @Prop({ type: String })
  postalCode: string;

  @Prop({ type: String })
  city: string;

  @Prop({ type: String })
  country: string;

  @Prop({ type: String })
  billingEmail: string;

  @Prop({ type: String })
  mobileNumber: string;

  @Prop({ type: Boolean, default: true })
  status: boolean;

  @Prop({ type: Boolean })
  termsAndCondition: boolean;

  @Prop({ type: Number })
  longitude: number;

  @Prop({ type: Number })
  latitude: number;

  @Prop({ type: geoLocationSchema, index: '2dsphere' })
  location: geoLocationSchema;
}
export const ProUserFinanceSchema =
  SchemaFactory.createForClass(ProUserFinance);
