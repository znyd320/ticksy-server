import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPositive } from 'class-validator';
import { OrderStatus } from '../../common/enum';

export class AddOrderStatusHistoryDto {
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

  remarks: string;
  time: Date;
}
