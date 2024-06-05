import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateConversationDto } from '../dto/create-conversation-dto';
import { CreateMessageDto } from '../dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @Inject('MESSAGE_SERVICE') private readonly client: ClientProxy,
  ) {}

  async findConversationsWithLastMessage(userId: string) {
    return this.client.send('find_conversations_with_last_message', userId);
  }

  async createConversation(conversationData: CreateConversationDto) {
    return this.client.send('create_conversation', conversationData);
  }
  async sendMessage(
    createMessageDto: CreateMessageDto,
    conversationId: string,
  ) {
    return this.client.send('send_message', {
      createMessageDto,
      conversationId,
    });
  }

  async findSingleUserConversationsList(userId: string) {
    return this.client.send('find_single_user_conversations_list', userId);
  }
}
