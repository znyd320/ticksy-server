import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { CreateConversationDto } from '../dto/create-conversation-dto';
import { CreateMessageDto } from '../dto/create-message.dto';
import { MessagesService } from '../service/messages.service';

@WebSocketGateway()
export class MessagesGateway {
  constructor(private readonly messagesService: MessagesService) {}

  @WebSocketServer()
  server: Socket;

  async handleConnection(@ConnectedSocket() client: Socket) {
    console.log(`Client connected: ${client.id}`);
    const userId = client.handshake.query.userId;
    console.log(userId);
    const previousConversations =
      await this.messagesService.findConversationsWithLastMessage(
        String(userId),
      );
    return previousConversations;
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('conversation')
  createConversation(@MessageBody() conversationData: CreateConversationDto) {
    return this.messagesService.createConversation(conversationData);
  }

  @SubscribeMessage('message')
  async sendMessage(
    @MessageBody() createMessageDto: CreateMessageDto,
    @MessageBody() conversationId: string,
  ) {
    return this.messagesService.sendMessage(createMessageDto, conversationId);
  }

  @SubscribeMessage('single_user_conversations_list')
  async findSingleUserConversationsList(@MessageBody() userId: string) {
    return this.messagesService.findSingleUserConversationsList(userId);
  }
}
