import { PartialType } from '@nestjs/swagger';
import { CreateRefundOrderDto } from './create-refund-order.dto';

export class UpdateRefundOrderDto extends PartialType(CreateRefundOrderDto) {}
