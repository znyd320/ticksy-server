import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateNotificationGroupDto } from '../dto/create-notification-group.dto';
import { NotificationGroup } from '../entities/notification-group.entity';
import {
  DATA_FOUND,
  FAIELD_RESPONSE,
  NOTIFICATION_GROUP_ALREADY_EXIST,
  NO_DATA_FOUND,
  SOMETHING_WENT_WRONG,
  SUCCESS_RESPONSE,
  USER_ALREADY_EXIST,
} from 'src/common/constants/message.response';
import { createApiResponse } from 'src/common/constants';
import { SortBy } from 'src/common/enum/enum-sort-by';
import { UpdateNotificationGroupDto } from '../dto/update-notification-group.dto';

@Injectable()
export class NotificationGroupService {
  constructor(
    @InjectModel(NotificationGroup.name)
    private readonly notificationGroupModel: Model<NotificationGroup>,
  ) {}

  async create(createNotificationGroupDto: CreateNotificationGroupDto) {
    const { groupName, description, userIds } = createNotificationGroupDto;

    const existingGroup = await this.notificationGroupModel.findOne({
      groupName,
    });

    if (existingGroup) {
      throw new HttpException(NOTIFICATION_GROUP_ALREADY_EXIST, HttpStatus.CONFLICT);
    }


    let uniqueUserIds : any = [...new Set(userIds)];
    uniqueUserIds = uniqueUserIds.map((userId : string) => new Types.ObjectId(userId));

    const notificationGroup = new this.notificationGroupModel({
      groupName,
      description,
      userIds: uniqueUserIds,
    });

    return notificationGroup.save();
  }

  async addUserIds(groupId: string, userIds: Types.ObjectId[]) {
    userIds = userIds.map((userId) => new Types.ObjectId(userId));

    const notificationGroup =
      await this.notificationGroupModel.findById(groupId);

    if (!notificationGroup) {
      throw new HttpException(
        'Notification group not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const uniqueUserIds = [
      ...new Set([...notificationGroup.userIds, ...userIds]),
    ];

    notificationGroup.userIds = uniqueUserIds;
    return notificationGroup.save();
  }

  async removeUserIds(groupId: string, userIds: Types.ObjectId[]) {
    userIds = userIds.map((userId) => new Types.ObjectId(userId));
    const notificationGroup =
      await this.notificationGroupModel.findById(groupId);

    if (!notificationGroup) {
      throw new HttpException(
        'Notification group not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const updatedUserIds = notificationGroup.userIds.filter(
      (userId) => !userIds.includes(userId),
    );

    notificationGroup.userIds = updatedUserIds;
    return notificationGroup.save();
  }

  async findOne(groupId: string) {
    return this.notificationGroupModel.findById(groupId);
  }

  async findAll(
    page: number,
    limit: number,
    order: string,
    sort: SortBy,
    search: string,
    startDate: Date,
    endDate: Date,
  ) {
    try {
      const pipeline: any[] = [];
      const matchStage: any = {};

      if (search) {
        const searchRegex = new RegExp(search, 'i');
        const allFields = Object.keys(this.notificationGroupModel.schema.obj);

        matchStage.$or = allFields.map((field) => ({
          [field]: { $regex: searchRegex },
        }));
      }

      if (startDate && endDate) {
        const startDateObject = new Date(startDate);
        const endDateObject = new Date(endDate);

        matchStage.createdAt = {
          $gte: startDateObject,
          $lt: endDateObject,
        };
      }

      if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
      }

      pipeline.push({ $count: 'total' });

      const totalResult = await this.notificationGroupModel.aggregate(pipeline);
      const total = totalResult.length > 0 ? totalResult[0].total : 0;

      pipeline.pop();

      const startIndex = (page - 1) * limit;
      pipeline.push({ $skip: startIndex });
      pipeline.push({ $limit: parseInt(limit.toString(), 10) });

      const sortStage: any = {};
      sortStage[order] = sort === 'desc' ? -1 : 1;
      pipeline.push({ $sort: sortStage });

      const data = await this.notificationGroupModel.aggregate(pipeline);

      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;
      const nextPage = hasNextPage ? Number(page) + 1 : null;
      const prevPage = hasPrevPage ? Number(page) - 1 : null;

      if (data.length > 0) {
        return createApiResponse(HttpStatus.OK, SUCCESS_RESPONSE, DATA_FOUND, {
          data,
          pagination: {
            total,
            totalPages,
            currentPage: Number(page),
            hasNextPage,
            hasPrevPage,
            nextPage,
            prevPage,
          },
        });
      } else {
        return createApiResponse(
          HttpStatus.OK,
          SUCCESS_RESPONSE,
          NO_DATA_FOUND,
        );
      }
    } catch (error) {
      return createApiResponse(
        HttpStatus.BAD_REQUEST,
        FAIELD_RESPONSE,
        SOMETHING_WENT_WRONG,
        error.message,
      );
    }
  }

  async update(
    id: string,
    updateNotificationGroupDto: UpdateNotificationGroupDto,
  ) {
    try {
      const data = await this.notificationGroupModel
        .findByIdAndUpdate(id, updateNotificationGroupDto, { new: true })
        .exec();
      if (data) {
        return createApiResponse(
          HttpStatus.OK,
          SUCCESS_RESPONSE,
          DATA_FOUND,
          data,
        );
      } else {
        return createApiResponse(
          HttpStatus.NOT_FOUND,
          FAIELD_RESPONSE,
          NO_DATA_FOUND,
        );
      }
    } catch (error) {
      return createApiResponse(
        HttpStatus.BAD_REQUEST,
        FAIELD_RESPONSE,
        SOMETHING_WENT_WRONG,
        error.message,
      );
    }
  }

  async remove(id: string) {
    try {
      const data = await this.notificationGroupModel
        .findByIdAndDelete(id)
        .exec();
      if (data) {
        return createApiResponse(
          HttpStatus.OK,
          SUCCESS_RESPONSE,
          DATA_FOUND,
          data,
        );
      } else {
        return createApiResponse(
          HttpStatus.NOT_FOUND,
          FAIELD_RESPONSE,
          NO_DATA_FOUND,
        );
      }
    } catch (error) {
      return createApiResponse(
        HttpStatus.BAD_REQUEST,
        FAIELD_RESPONSE,
        SOMETHING_WENT_WRONG,
        error.message,
      );
    }
  }
}
