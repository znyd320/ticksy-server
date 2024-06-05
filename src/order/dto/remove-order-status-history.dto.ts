import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { OrderStatus } from '../../common/enum';

export class RemoveOrderStatusHistoryDto {
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
}
