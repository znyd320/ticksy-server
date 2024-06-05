import { IsNotEmpty } from 'class-validator';

export class PushNotificationToAllDto {
  @IsNotEmpty()
  readonly title: string;

  @IsNotEmpty()
  readonly body: string;

  readonly image_url: string;

  readonly data: any;
}
