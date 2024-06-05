import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ValidateAndUpdatePasswordDto {
  @ApiProperty({ type: Number, example: 1234, required: true })
  @IsNotEmpty()
  verificationCode: number;

  @ApiProperty({ type: String, example: 'password123', required: true })
  @IsNotEmpty()
  password: string;
}
