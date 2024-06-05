import { Types } from 'mongoose';
import { PushNotificationDto } from 'src/notification/dto/send-notification-to-users.dto';

export function orderCreateUserNotificationPayload(
  product_name: string,
  user_id: string | Types.ObjectId,
  product_image_url: string,
): PushNotificationDto {
  user_id = user_id.toString();
  const payload: PushNotificationDto = {
    title: 'Your Order has been placed',
    body: `Your order for ${product_name} has been placed`,
    image_url: product_image_url,
    data: {
      user_id: user_id,
    },
    user_ids: [user_id],
  };

  return payload;
}

export function orderCreateProUserNotificationPayload(
  product_name: string,
  user_id: string,
  product_image_url: string,
): PushNotificationDto {
  const payload: PushNotificationDto = {
    title: 'You Have a New Order',
    body: `You have a new order for ${product_name} Bucket`,
    image_url: product_image_url,
    data: {
      user_id: user_id,
    },
    user_ids: [user_id],
  };

  return payload;
}
