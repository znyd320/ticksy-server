import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class SendNotificationEmailDto {
  @IsNotEmpty()
  @IsEmail()
  readonly to: string;

  @IsNotEmpty()
  readonly subject: string;

  @IsOptional()
  readonly text: string;
  @IsOptional()
  readonly html: string;
}
