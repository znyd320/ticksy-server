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

export class UpdateOrderStatusDto {
  @ApiProperty({
    type: String,
    description: 'Status of the order',
    enum: OrderStatus,
    example: OrderStatus.PENDING,
  })
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  readonly orderStatus: string;

  @ApiProperty({
    type: String,
    description: 'Order Status History Remarks',
    example: 'Order has been created!',
  })
  @IsNotEmpty()
  readonly remarks: string;
}
