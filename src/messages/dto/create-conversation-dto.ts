import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { CreateMessageDto } from './create-message.dto';

export class CreateConversationDto {
  @ApiProperty({
    description: 'Array of user IDs participating in the conversation',
  })
  @IsArray()
  participants: string[];

  @ApiProperty({ description: 'Title of the conversation' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Array of messages sent in the conversation' })
  @ValidateNested({ each: true })
  @Type(() => CreateMessageDto)
  messages?: CreateMessageDto[];
}
