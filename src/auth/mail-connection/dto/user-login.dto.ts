import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class UserLoginDto {
  @ApiProperty({
    type: String,
    example: 'excel.azmin@gmail.com',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @ApiProperty({ type: String, example: 'password123', required: true })
  password: string;

  @ApiProperty({ type: String, example: '' })
  deviceToken: string;
}
