import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RefundOrderController } from './controller/refund-order.controller';
import { RefundOrderSchema } from './entities/refund-order.entity';
import { RefundOrderService } from './service/refund-order.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'RefundOrder', schema: RefundOrderSchema },
    ]),
  ],
  controllers: [RefundOrderController],
  providers: [RefundOrderService],
})
export class RefundOrderModule {}
