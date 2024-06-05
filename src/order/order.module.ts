import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationModule } from 'src/notification/notification.module';
import { ReviewModule } from 'src/review/review.module';
import { ProUserFinanceModule } from '../pro-user-finance/pro-user-finance.module';
import { SurprisedBucktModule } from '../surprised-bucket/surprised-bucket.module';
import { UserModule } from '../user/user.module';
import { OrderController } from './controller/order.controller';
import { OrderSchema } from './entities/order.entity';
import { OrderService } from './service/order.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ORDER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [`amqp://localhost:5672`],
          queue: 'order-service',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
    MongooseModule.forFeature([{ name: 'Order', schema: OrderSchema }]),
    UserModule,
    SurprisedBucktModule,
    ProUserFinanceModule,
    ReviewModule,
    NotificationModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule { }
