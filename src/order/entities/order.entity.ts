import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { OrderStatus } from '../../common/enum/enum-order-status';
import { PaymentAccountType } from '../../common/enum/enum-payment-account-type';
import { PaymentStatus } from '../../common/enum/enum-payment-status';

export class OrderStatusHistory {
  status: OrderStatus;
  remarks: string;
  time: Date;
}

@Schema({ timestamps: true, versionKey: false })
export class Order extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  orderBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'SurprisedBucket' })
  bucketId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ProUserFinance' })
  restaurantId: Types.ObjectId;

  @Prop({ type: Number })
  qty: number;

  @Prop({ type: Number })
  amount: number;

  @Prop({ type: Number })
  totalAmount: number;

  @Prop({ type: String, enum: PaymentAccountType })
  paymentAccountType: string;

  @Prop({ type: String, enum: PaymentStatus })
  paymentStatus: string;

  @Prop({
    type: String,
    enum: OrderStatus,
    default: OrderStatus.PENDING,
    required: true,
  })
  orderStatus: string;

  @Prop({ type: Boolean })
  isRefundable: boolean;

  @Prop({ type: String })
  transactionID: string;

  @Prop({ type: Object })
  userDetails: any;

  @Prop({ type: Object })
  bucketDetails: any;

  @Prop({ type: Object })
  restorantDetails: any;

  @Prop({ type: [OrderStatusHistory] })
  orderStatusHistory: OrderStatusHistory[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.pre<Order>('save', function (next) {
  this.totalAmount = this.qty * this.amount;
  next();
});
