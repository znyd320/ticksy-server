import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';


export class PushNotificationToGroupDto {
  @ApiProperty({
    type: String,
    description: 'Title of the notification',
    example: 'New Order Received',
  })
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @ApiProperty({
    type: String,
    description: 'Body or content of the notification',
    example: 'You have received a new order from John Doe',
  })
  @IsNotEmpty()
  @IsString()
  readonly body: string;

  @ApiProperty({
    type: String,
    description: 'URL of the image to be displayed in the notification',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly image_url?: string;

  @ApiProperty({
    type: 'any',
    description: 'Additional data to be sent with the notification',
    required: false,
  })
  @IsOptional()
  readonly data?: any;

  user_list?: any[];
}
