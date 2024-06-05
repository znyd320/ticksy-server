import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsPositive,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';
import { OrderStatus, PaymentAccountType } from '../../common/enum';
import { PaymentStatus } from '../../common/enum/enum-payment-status';
import { Transform } from 'class-transformer';

export class CreateRefundOrderDto {
  @ApiProperty({
    type: String,
    description: 'ID of the user initiating the refund',
    example: '60c6e2349a0cdc40f8b5f4d2',
    required: true,
  })
  @IsNotEmpty()
  @IsMongoId()
  @Transform(({ value }) => new Types.ObjectId(value))
  readonly refundBy: Types.ObjectId;

  @ApiProperty({
    type: String,
    description: 'ID of the user against whom the refund is initiated',
    example: '60c6e2349a0cdc40f8b5f4d3',
    required: true,
  })
  @IsNotEmpty()
  @IsMongoId()
  @Transform(({ value }) => new Types.ObjectId(value))
  readonly refundAgainst: Types.ObjectId;

  @ApiProperty({
    type: String,
    description: 'ID of the surprised bucket for the refund',
    example: '60c6e2349a0cdc40f8b5f4d4',
    required: true,
  })
  @IsNotEmpty()
  @IsMongoId()
  @Transform(({ value }) => new Types.ObjectId(value))
  readonly bucketId: Types.ObjectId;

  @ApiProperty({
    type: Number,
    description: 'Quantity of items in the refund order',
    example: 2,
  })
  @IsPositive()
  readonly qty: number;

  @ApiProperty({
    type: Number,
    description: 'Unit amount for each item',
    example: 10,
  })
  @IsPositive()
  readonly amount: number;

  @ApiProperty({
    type: String,
    description: 'Payment status of the refund order',
    enum: PaymentStatus,
    example: PaymentStatus.PENDING,
  })
  @IsEnum(PaymentStatus)
  readonly paymentStatus: string;

  @ApiProperty({
    type: String,
    description: 'Status of the refund order',
    enum: OrderStatus,
    example: OrderStatus.SUCCESS,
  })
  @IsEnum(OrderStatus)
  readonly orderStatus: string;

  @ApiProperty({
    type: Boolean,
    description: 'Whether the refund is completed',
    example: true,
    default: false,
  })
  @IsBoolean()
  readonly isRefunded: boolean;

  @ApiProperty({
    type: String,
    description: 'Type of payment account for the refund',
    enum: PaymentAccountType,
    example: PaymentAccountType.STRIPE,
  })
  @IsEnum(PaymentAccountType)
  readonly paymentAccountType: string;

  @ApiProperty({
    type: String,
    description: 'Transaction ID for the refund',
    example: 'txn_refund_12345',
  })
  @IsNotEmpty()
  @IsString()
  readonly transactionID: string;
}
