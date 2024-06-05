import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PaymentAccountType } from '../../common/enum/enum-payment-account-type';
import { DateTimeRangeInterface } from '../../common/interface/date-time-range.interface';

@Schema({ timestamps: true, versionKey: false })
export class FinanceSettings extends Document {
  @Prop({ type: String, required: true })
  paymentCycleName: string;

  @Prop({ type: Object })
  dateRange: DateTimeRangeInterface;

  @Prop({ type: Number, required: true })
  minimumWithdrawAmount: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: String, enum: PaymentAccountType })
  paymentAccountType: string;
}

export const FinanceSettingsSchema =
  SchemaFactory.createForClass(FinanceSettings);
