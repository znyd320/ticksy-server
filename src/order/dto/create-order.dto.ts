import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsPositive,
  IsString,
} from 'class-validator';
import { OrderStatus } from '../../common/enum/enum-order-status';
import { PaymentAccountType } from '../../common/enum/enum-payment-account-type';
import { PaymentStatus } from '../../common/enum/enum-payment-status';
import { AddOrderStatusHistoryDto } from './add-order-status-history.dto';
import { OrderStatusHistory } from '../entities/order.entity';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';

export class CreateOrderDto {
  @ApiProperty({
    type: String,
    description: 'ID of the surprised bucket in the order',
    example: '60c6e2349a0cdc40f8b5f4d3',
    required: true,
  })
  @IsNotEmpty()
  @Transform(({ value }) => new Types.ObjectId(value))
  readonly bucketId: string;

  @ApiProperty({
    type: String,
    description: 'ID of the restaurant for the order',
    example: '60c6e2349a0cdc40f8b5f4d4',
    required: true,
  })
  @IsNotEmpty()
  @Transform(({ value }) => new Types.ObjectId(value))
  readonly restaurantId: string;

  @ApiProperty({
    type: Number,
    description: 'Quantity of items in the order',
    example: 2,
    required: true,
  })
  @IsNotEmpty()
  @IsPositive()
  readonly qty: number;

  @ApiProperty({
    type: String,
    description: 'Type of payment account',
    enum: PaymentAccountType,
    example: PaymentAccountType.STRIPE,
  })
  @IsNotEmpty()
  @IsEnum(PaymentAccountType)
  readonly paymentAccountType: string;

  @ApiProperty({
    type: String,
    description: 'Payment status of the order',
    enum: PaymentStatus,
    example: PaymentStatus.PENDING,
  })
  @IsNotEmpty()
  @IsEnum(PaymentStatus)
  readonly paymentStatus: string;

  @ApiProperty({
    type: Boolean,
    description: 'Whether the order is refundable',
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  readonly isRefundable: boolean;

  @ApiProperty({
    type: String,
    description: 'Transaction ID for the order',
    example: 'txn_12345',
  })
  @IsString()
  readonly transactionID: string;

  amount: number;
  orderBy: Types.ObjectId;
  orderStatusHistory: OrderStatusHistory[];
  userDetails: any;
  restaurantDetails: any;
  bucketDetails: any;
  orderStatus: string;
}
