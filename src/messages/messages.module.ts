import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MessagesGateway } from './gateway/messages.gateway';
import { MessagesService } from './service/messages.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MESSAGE_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [`amqp://localhost:5672`],
          queue: 'message-service',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  providers: [MessagesGateway, MessagesService],
})
export class MessagesModule { }
