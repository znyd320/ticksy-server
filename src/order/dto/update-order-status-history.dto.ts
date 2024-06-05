import { IsNotEmpty, IsEnum } from 'class-validator';
import { OrderStatus } from '../../common/enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrderStatusHistoryDto {
  @ApiProperty({
    type: String,
    description:
      'Order Status. Example: ' + Object.values(OrderStatus).join(', '),
    example: OrderStatus.PENDING,
    required: true,
    enum: OrderStatus,
  })
  @IsNotEmpty()
  readonly status: string;

  @ApiProperty({
    type: Boolean,
    description: 'Is this status complete?',
    example: false,
    required: false,
  })
  readonly isComplete: number;

  @ApiProperty({
    type: String,
    description: 'Remarks',
    example: 'Order is pending',
    required: false,
  })
  readonly remarks: string;
}
