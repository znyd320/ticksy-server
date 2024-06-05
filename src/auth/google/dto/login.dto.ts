import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleLoginDto {
  @ApiProperty({
    description: 'Google access token',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
  @ApiProperty({
    description: 'Device token',
  })
  @IsString()
  @IsNotEmpty()
  deviceToken: string;
}
