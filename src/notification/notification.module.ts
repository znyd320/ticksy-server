import { Global, Module, forwardRef } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from 'src/user/user.module';
import { NotificationGroupController } from './controller/notification.controller';
import { NotificationGroup, NotificationGroupSchema } from './entities/notification-group.entity';
import { NotificationGroupService } from './service/notification-group.service';
import { NotificationService } from './service/notification.service';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [`amqp://localhost:5672`],
          queue: 'notification-service',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
    MongooseModule.forFeature([{ name: NotificationGroup.name, schema: NotificationGroupSchema }]),
    forwardRef(() => UserModule),
  ],
  controllers: [NotificationGroupController],
  providers: [NotificationService, NotificationGroupService],
  exports: [NotificationService],
})
export class NotificationModule { }
