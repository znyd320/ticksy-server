import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class userVerificationDto {
  @ApiProperty({ example: '1234' })
  @IsNotEmpty()
  verificationCode: number;
}
