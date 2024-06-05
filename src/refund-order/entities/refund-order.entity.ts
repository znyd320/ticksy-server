import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { OrderStatus, PaymentAccountType } from '../../common/enum';
import { PaymentStatus } from '../../common/enum/enum-payment-status';

@Schema({ timestamps: true, versionKey: false })
export class RefundOrder extends Document {
  @Prop({ type: Types.ObjectId, ref: 'ProUserFinance' })
  refundBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  refundAgainst: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'SurprisedBucket' })
  bucketId: Types.ObjectId;

  @Prop({ type: Number })
  qty: number;

  @Prop({ type: Number })
  amount: number;

  @Prop({ type: Number })
  totalAmount: number;

  @Prop({ type: String, enum: PaymentStatus })
  paymentStatus: string;

  @Prop({ type: String, enum: OrderStatus })
  orderStatus: string;

  @Prop({ type: Boolean, default: false })
  isRefunded: boolean;

  @Prop({ type: String, enum: PaymentAccountType })
  paymentAccountType: string;

  @Prop({ type: String })
  transactionID: string;
}

export const RefundOrderSchema = SchemaFactory.createForClass(RefundOrder);

RefundOrderSchema.pre<RefundOrder>('save', function (next) {
  this.totalAmount = this.qty * this.amount;
  next();
});
