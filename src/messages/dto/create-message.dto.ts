import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({
    type: String,
    description: 'ID of the sender',
    example: '6093a26d0b8b3d001f55a38a',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  senderId: string;

  @ApiProperty({
    type: String,
    description: 'ID of the receiver',
    example: '6093a26d0b8b3d001f55a38b',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  receiverId: string;

  @ApiProperty({
    type: String,
    description: 'Text of the message',
    example: 'Hello, how are you?',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  text: string;

  @ApiProperty({
    type: Boolean,
    description: 'Indicates whether the message is seen or not',
    example: false,
    required: false,
  })
  @IsBoolean()
  isSeen: boolean;

  @ApiProperty({
    type: String,
    description: 'Attachment of the message',
    example: 'https://example.com/attachment',
    required: false,
  })
  @IsUrl()
  attachment: string;
}
