import { HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { UserService } from 'src/user/service/user.service';
import { PushNotificationDto } from '../dto/send-notification-to-users.dto';
import { SendNotificationEmailDto } from '../dto/send-notification-email.dto';
import { PushNotificationToGroupDto } from '../dto/send-notification-to-group.dto';
import { PushNotificationToAllDto } from '../dto/send-push-notification-to-all.dto';
import { NotificationGroupService } from './notification-group.service';
import { FAIELD_RESPONSE, NOTIFICATION_GROUP_NOT_FOUND, createApiResponse } from 'src/common/constants';

@Injectable()
export class NotificationService {
  constructor(
    @Inject('NOTIFICATION_SERVICE') private readonly client: ClientProxy,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly notificationGroupService: NotificationGroupService,
  ) {}

  async sendNotificationEmail(
    sendNotificationEmailDto: SendNotificationEmailDto,
  ) {
    const result = this.client.send(
      'send_notification_email',
      sendNotificationEmailDto,
    );

    const res = await firstValueFrom(result);
    return res;
  }

  async sendNotificationToSpecificUsers(
    pushNotificationDto: PushNotificationDto,
  ) {
    try{
      const user_ids = pushNotificationDto.user_ids;
  
      const userDetails = await this.userService.findAllUserForNotify(user_ids);
  
      const userWithToken = userDetails.map((user) => {
        return {
          _id: user._id,
          token: user.token,
          email: user.email,
          allowPushNotification: user.allowPushNotification,
          allowEmailNotification: user.allowEmailNotification,
        };
      });
  
      pushNotificationDto.user_list = userWithToken;
  
      let result = this.client.send(
        'send_notification_to_users',
        pushNotificationDto,
      );
      result = await firstValueFrom(result);
      return result;
    }catch(error){
      console.log(error)
      return createApiResponse(
        HttpStatus.BAD_REQUEST,
        FAIELD_RESPONSE,
        error.message,
      );
    }
  }

  async sendNotificationToAllUsers(
    pushNotificationDto: PushNotificationToAllDto,
  ) {
    try{
      let result = this.client.send(
        'send_push_notification_to_all_users',
        pushNotificationDto,
      );
      result = await firstValueFrom(result);
      return result;
    }catch(error){
      console.log(error)
      return createApiResponse(
        HttpStatus.BAD_REQUEST,
        FAIELD_RESPONSE,
        error.message,
      );
    }
  }



  async sendNotificationToGroup(geoupId: string , pushNotificationToGroupDto : PushNotificationToGroupDto){
    try{
      let groupDetails = await this.notificationGroupService.findOne(geoupId)
      if(!groupDetails){
        return createApiResponse(
          HttpStatus.NOT_FOUND,
          FAIELD_RESPONSE,
          NOTIFICATION_GROUP_NOT_FOUND,
        )
      }

      const user_ids = groupDetails.userIds.map((user) => user.toString());

      const notificationPayload : PushNotificationDto = {
        title: pushNotificationToGroupDto.title,
        body: pushNotificationToGroupDto.body,
        image_url: pushNotificationToGroupDto.image_url,
        data: pushNotificationToGroupDto.data,
        user_ids: user_ids,
      }
      
      return this.sendNotificationToSpecificUsers(notificationPayload)

    }catch(err){
      return createApiResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        FAIELD_RESPONSE,
        err.message,
      )
    }
  }

  findNotificationsByUser(page: number, pageSize: number, userId: string) {
    return this.client.send('get_notification_by_user', {
      page,
      pageSize,
      userId,
    });
  }

  updateAsRead(notificationId: string) {
    return this.client.send('mark_as_read', notificationId);
  }

}
