import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateProUserFinanceDto } from '../dto/create-pro-user-finance.dto';
import { UpdateProUserFinanceDto } from '../dto/update-pro-user-finance.dto';
import { ProUserFinance } from '../entities/pro-user-finance.entity';

import {
  DATA_FOUND,
  DATA_UPDATE_SUCCESSFUL,
  FAIELD_RESPONSE,
  NO_DATA_FOUND,
  PRO_USER_FINANCE_CREATED_FAILED,
  PRO_USER_FINANCE_CREATED_SUCCESSFULLY,
  PRO_USER_FINANCE_NOT_EXIST,
  PRO_USER_NO_DATA_FOUND_WITHIN_RADIUS,
  PRO_USER_PRIMARY_USER_NOT_FOUND,
  SOMETHING_WENT_WRONG,
  SUCCESS_RESPONSE,
  SURPRISED_BUCKET_NOT_EXIST,
} from '../../common/constants';

import { SurprisedBucktService } from 'src/surprised-bucket/service/surprised-buckt.service';
import { createApiResponse } from '../../common/constants/create-api.response';
import { SortBy } from '../../common/enum/enum-sort-by';
import { UserService } from '../../user/service/user.service';
import { CreateOrderDto } from 'src/order/dto/create-order.dto';

@Injectable()
export class ProUserFinanceService {
  constructor(
    @InjectModel(ProUserFinance.name)
    private readonly proUserFinanceModel: Model<ProUserFinance>,
    private readonly userService: UserService,
    private readonly surprisedBucktService: SurprisedBucktService,
  ) {}

  async create(createProUserFinanceDto: CreateProUserFinanceDto) {
    try {
      const isUserExist = await this.userService.isExist(
        String(createProUserFinanceDto.proUserDetails),
      );
      if (!isUserExist) {
        return createApiResponse(
          HttpStatus.BAD_REQUEST,
          FAIELD_RESPONSE,
          PRO_USER_PRIMARY_USER_NOT_FOUND,
        );
      }

      const createdProUserFinance = new this.proUserFinanceModel(
        createProUserFinanceDto,
      );
      await createdProUserFinance.save();

      return createApiResponse(
        HttpStatus.CREATED,
        SUCCESS_RESPONSE,
        PRO_USER_FINANCE_CREATED_SUCCESSFULLY,
        createdProUserFinance,
      );
    } catch (err) {
      return createApiResponse(
        HttpStatus.EXPECTATION_FAILED,
        FAIELD_RESPONSE,
        PRO_USER_FINANCE_CREATED_FAILED,
        err.message,
      );
    }
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
        const allFields = Object.keys(this.proUserFinanceModel.schema.obj);

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

      const totalResult = await this.proUserFinanceModel.aggregate(pipeline);
      const total = totalResult.length > 0 ? totalResult[0].total : 0;

      pipeline.pop();

      const startIndex = (page - 1) * limit;
      pipeline.push(
        { $skip: startIndex },
        { $limit: parseInt(limit.toString(), 10) },
      );

      const sortStage: any = {};
      sortStage[order] = sort === 'desc' ? -1 : 1;
      pipeline.push({ $sort: sortStage });

      const data = await this.proUserFinanceModel.aggregate(pipeline);

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
        error,
      );
    }
  }

  async findAllWithoutPagination() {
    try {
      const allData = await this.proUserFinanceModel.find();
      if (allData.length > 0) {
        return createApiResponse(
          HttpStatus.OK,
          SUCCESS_RESPONSE,
          DATA_FOUND,
          allData,
        );
      } else {
        return createApiResponse(
          HttpStatus.NOT_FOUND,
          SUCCESS_RESPONSE,
          PRO_USER_FINANCE_NOT_EXIST,
        );
      }
    } catch (err) {
      return createApiResponse(
        HttpStatus.BAD_REQUEST,
        FAIELD_RESPONSE,
        SOMETHING_WENT_WRONG,
        err.message,
      );
    }
  }

  async findAllByGeoLocation(
    latitude: number,
    longitude: number,
    radius: number,
  ) {
    try {
      latitude = Number(latitude);
      longitude = Number(longitude);
      radius = Number(radius);

      const allData = await this.proUserFinanceModel.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            $maxDistance: radius,
          },
        },
      });

      if (allData.length > 0) {
        return createApiResponse(
          HttpStatus.OK,
          SUCCESS_RESPONSE,
          DATA_FOUND,
          allData,
        );
      } else {
        return createApiResponse(
          HttpStatus.OK,
          SUCCESS_RESPONSE,
          PRO_USER_NO_DATA_FOUND_WITHIN_RADIUS,
        );
      }
    } catch (err) {
      return createApiResponse(
        HttpStatus.BAD_REQUEST,
        FAIELD_RESPONSE,
        SOMETHING_WENT_WRONG,
        err.message,
      );
    }
  }

  async findOne(id: string) {
    try {
      const data = await this.proUserFinanceModel.findById(id).exec();

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
          SUCCESS_RESPONSE,
          NO_DATA_FOUND,
        );
      }
    } catch (error) {
      return createApiResponse(
        HttpStatus.BAD_REQUEST,
        FAIELD_RESPONSE,
        SOMETHING_WENT_WRONG,
        error,
      );
    }
  }

  async findByUserId(id: any) {
    try {
      id = id.trim();
      const data = await this.proUserFinanceModel
        .findOne({ proUserDetails: { $in: [id, new Types.ObjectId(id)] } })
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
          SUCCESS_RESPONSE,
          NO_DATA_FOUND,
        );
      }
    } catch (error) {
      return createApiResponse(
        HttpStatus.BAD_REQUEST,
        FAIELD_RESPONSE,
        SOMETHING_WENT_WRONG,
        error,
      );
    }
  }

  async findByBucketId(id: string) {
    try {
      id = id.trim();
      const surpriseBucket = await this.surprisedBucktService.findById(id);
      if (!surpriseBucket) {
        return createApiResponse(
          HttpStatus.NOT_FOUND,
          FAIELD_RESPONSE,
          SURPRISED_BUCKET_NOT_EXIST,
        );
      }

      const proUserFinance = await this.proUserFinanceModel
        .findById(surpriseBucket.proUserDetails)
        .exec();

      if (!proUserFinance) {
        return createApiResponse(
          HttpStatus.NOT_FOUND,
          FAIELD_RESPONSE,
          PRO_USER_FINANCE_NOT_EXIST,
        );
      }

      return createApiResponse(
        HttpStatus.FOUND,
        SUCCESS_RESPONSE,
        DATA_FOUND,
        proUserFinance,
      );
    } catch (err) {
      return createApiResponse(
        HttpStatus.BAD_REQUEST,
        FAIELD_RESPONSE,
        SOMETHING_WENT_WRONG,
        err.message,
      );
    }
  }

  async update(id: string, updateProUserFinanceDto: UpdateProUserFinanceDto) {
    try {
      const user = await this.proUserFinanceModel.findById(id).exec();
      const user_id = user.proUserDetails;

      let access_token;
      if (updateProUserFinanceDto.status) {
        await this.userService.update(user_id, {
          roles: ['User', 'Pro User'],
        });
        access_token = await this.userService.getAccessTokenByUserID(
          String(user_id),
        );
      } else if (updateProUserFinanceDto.status == false) {
        await this.userService.update(user_id, {
          roles: ['User'],
        });
        access_token = await this.userService.getAccessTokenByUserID(
          String(user_id),
        );
      }

      const data = await this.proUserFinanceModel
        .findByIdAndUpdate(id, updateProUserFinanceDto, { new: false })
        .exec();

      const responseData = access_token ? access_token : { data: data };
      return createApiResponse(
        HttpStatus.OK,
        SUCCESS_RESPONSE,
        DATA_UPDATE_SUCCESSFUL,
        responseData,
      );
    } catch (error) {
      console.log('error', error);
      return createApiResponse(
        HttpStatus.BAD_REQUEST,
        FAIELD_RESPONSE,
        SOMETHING_WENT_WRONG,
        error,
      );
    }
  }

  async dashbordCounting() {
    const result = await this.proUserFinanceModel.aggregate([
      {
        $group: {
          _id: null,
          totalProUser: { $sum: 1 },
          totalApprovedProUser: {
            $sum: { $cond: [{ $eq: ['$status', true] }, 1, 0] },
          },
          totalUnApprovedProUser: {
            $sum: { $cond: [{ $eq: ['$status', false] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ]);

    if (result.length > 0) {
      return result[0];
    } else {
      return {
        totalProUser: 0,
        totalApprovedProUser: 0,
        totalUnApprovedProUser: 0,
      };
    }
  }

  async remove(id: string) {
    try {
      const user = await this.proUserFinanceModel.findById(id).exec();

      const user_id = user.proUserDetails;

      const isUserExist = await this.userService.isExist(String(user_id));
      if (!isUserExist) {
        return createApiResponse(
          HttpStatus.NOT_FOUND,
          FAIELD_RESPONSE,
          PRO_USER_PRIMARY_USER_NOT_FOUND,
        );
      }

      await this.userService.update(user_id, {
        roles: ['User'],
      });

      const access_token = await this.userService.getAccessTokenByUserID(
        String(user_id),
      );
      const data = await this.proUserFinanceModel.findByIdAndDelete(id).exec();
      const responseData = access_token ? access_token : { data: data };

      if (data) {
        return createApiResponse(
          HttpStatus.OK,
          SUCCESS_RESPONSE,
          DATA_FOUND,
          responseData,
        );
      }

      return createApiResponse(
        HttpStatus.NOT_FOUND,
        FAIELD_RESPONSE,
        NO_DATA_FOUND,
      );
    } catch (error) {
      console.log(error);
      return createApiResponse(
        HttpStatus.BAD_REQUEST,
        FAIELD_RESPONSE,
        SOMETHING_WENT_WRONG,
        error,
      );
    }
  }

  async isExists(id: string) {
    return await this.proUserFinanceModel.exists({ _id: id }).exec();
  }

  async findById(id: string | Types.ObjectId) {
    return await this.proUserFinanceModel.findById(id).exec();
  }


}
