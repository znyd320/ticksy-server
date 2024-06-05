import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators';
import { DataSearchDecorator } from '../../common/decorators/data-search.decorator';
import { UserRole } from '../../common/enum';
import { SortBy } from '../../common/enum/enum-sort-by';
import { ValidateDtoPipe } from '../../common/pipe/validate-dto.pipe';
import { CreateNotificationGroupDto } from '../dto/create-notification-group.dto';
import { UpdateNotificationGroupDto } from '../dto/update-notification-group.dto';
import { NotificationGroupService } from '../service/notification-group.service';
import { Types } from 'mongoose';
import { UpdateNotificationGroupMembersDto } from '../dto/update-notification-group-members.dto';
import { PushNotificationDto } from '../dto/send-notification-to-users.dto';
import { NotificationService } from '../service/notification.service';
import { PushNotificationToGroupDto } from '../dto/send-notification-to-group.dto';
import { GetSessionUser } from 'src/common/decorators/session-user.decorator';
import { AuthGuard, RolesGuard } from 'src/common/guard';
import { PushNotificationToAllDto } from '../dto/send-push-notification-to-all.dto';

@Controller('notification')
@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class NotificationGroupController {
  constructor(
    private readonly notificationGroupService: NotificationGroupService,
    private readonly notificationService: NotificationService,
  ) { }


  @Get('me')
  @Roles(UserRole.USER, UserRole.PRO_USER, UserRole.SYSTEM_ADMINISTRATOR)
  findPushNotifications(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @GetSessionUser() user: any,
  ) {
    return this.notificationService.findNotificationsByUser(page, pageSize, user?.sub);
  }

  @Post("users/push")
  @Roles(UserRole.SYSTEM_ADMINISTRATOR, UserRole.ADMINISTRATOR)
  async notifyToUser(@Body() pushNotificationDto: PushNotificationDto) {
    return this.notificationService.sendNotificationToSpecificUsers(pushNotificationDto);
  }

  @Post("all-users/push")
  @Roles(UserRole.SYSTEM_ADMINISTRATOR, UserRole.ADMINISTRATOR)
  async notifyToAllUser(@Body() pushNotificationDto: PushNotificationToAllDto) {
    return this.notificationService.sendNotificationToAllUsers(pushNotificationDto);
  }

  @Post("group/:groupId/push")
  @Roles(UserRole.SYSTEM_ADMINISTRATOR, UserRole.ADMINISTRATOR)
  async notifyToUsersOfGroup(
    @Param('groupId') groupId: string,
    @Body() pushNotificationToGroupDto: PushNotificationToGroupDto
  ) {
    return this.notificationService.sendNotificationToGroup(groupId, pushNotificationToGroupDto);
  }


  @Post(":notificationId/mark-as-read")
  @Roles(UserRole.SYSTEM_ADMINISTRATOR, UserRole.ADMINISTRATOR , UserRole.PRO_USER , UserRole.USER)
  async markAsRead(
    @Param('notificationId') notificationId: string,
  ) {
    return this.notificationService.updateAsRead(notificationId);
  }

  @Post("group")
  @Roles(UserRole.SYSTEM_ADMINISTRATOR, UserRole.ADMINISTRATOR)
  async create(@Body() createNotificationGroupDto: CreateNotificationGroupDto) {
    
    return this.notificationGroupService.create(createNotificationGroupDto);
  }

  @Get("group")
  @Roles(UserRole.SYSTEM_ADMINISTRATOR, UserRole.ADMINISTRATOR)
  @DataSearchDecorator([
    { name: 'startDate', type: Date, required: false, example: '2022-01-01' },
    { name: 'endDate', type: Date, required: false, example: '2022-02-01' },
  ])
  async findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('order') order: string,
    @Query('sort') sort: SortBy,
    @Query('search') search: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return this.notificationGroupService.findAll(
      page,
      limit,
      order,
      sort,
      search,
      startDate,
      endDate,
    );
  }


  @Patch('group/:id/add-users')
  @Roles(UserRole.SYSTEM_ADMINISTRATOR, UserRole.ADMINISTRATOR)
  async addUserIds(
    @Param('id') id: string,
    @Body() updateNotificationGroupMembersDto: UpdateNotificationGroupMembersDto,
  ) {
    const objUserIds = updateNotificationGroupMembersDto.userIds.map(
      (userId) => new Types.ObjectId(userId),
    );
    return this.notificationGroupService.addUserIds(id, objUserIds);
  }

  
  @Patch('group/:id/remove-users')
  @Roles(UserRole.SYSTEM_ADMINISTRATOR, UserRole.ADMINISTRATOR)
  async removeUserIds(
    @Param('id') id: string,
    @Body() updateNotificationGroupMembersDto: UpdateNotificationGroupMembersDto,
  ) {
    const objUserIds = updateNotificationGroupMembersDto.userIds.map(
      (userId) => new Types.ObjectId(userId),
    );
    return this.notificationGroupService.removeUserIds(id, objUserIds);
  }

  @Get('group/:id')
  @Roles(UserRole.SYSTEM_ADMINISTRATOR, UserRole.ADMINISTRATOR)
  async findOne(@Param('id') id: string) {
    return this.notificationGroupService.findOne(id);
  }

  @Patch('group/:id')
  @Roles(UserRole.SYSTEM_ADMINISTRATOR, UserRole.ADMINISTRATOR)
  async update(
    @Param('id') id: string,
    @Body() updateNotificationGroupDto: UpdateNotificationGroupDto,
  ) {
    return this.notificationGroupService.update(id, updateNotificationGroupDto);
  }

  @Delete('group/:id')
  @Roles(UserRole.SYSTEM_ADMINISTRATOR, UserRole.ADMINISTRATOR)
  async remove(@Param('id') id: string) {
    return this.notificationGroupService.remove(id);
  }
}
