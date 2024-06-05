import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BucketCategoryService } from '../../bucket-category/service/bucket-category.service';
import {
  BUCKET_CATEGORY_NOT_FOUND,
  BUCKET_PRICE_SETTINGS_CREATED_FAILED,
  BUCKET_PRICE_SETTINGS_CREATED_SUCCESS,
  DATA_FOUND,
  FAIELD_RESPONSE,
  NO_DATA_FOUND,
  SOMETHING_WENT_WRONG,
  SUCCESS_RESPONSE,
  createApiResponse,
} from '../../common/constants';
import { SortBy } from '../../common/enum/enum-sort-by';
import { CreateBucketPriceSettingDto } from '../dto/create-bucket-price-setting.dto';
import { UpdateBucketPriceSettingDto } from '../dto/update-bucket-price-setting.dto';
import { BucketPriceSetting } from '../entities/bucket-price-setting.entity';

@Injectable()
export class BucketPriceSettingsService {
  constructor(
    @InjectModel(BucketPriceSetting.name)
    private readonly bucketPriceSettingModel: Model<BucketPriceSetting>,
    private readonly bucketCategoryService: BucketCategoryService,
  ) {}

  async create(
    createBucketPriceSettingDto: CreateBucketPriceSettingDto,
    user: any,
  ) {
    try {
      createBucketPriceSettingDto.createdBy = user.sub;

      const categoryId: any = createBucketPriceSettingDto.categoryId;

      const isCategoryExist =
        await this.bucketCategoryService.isExist(categoryId);

      if (!isCategoryExist) {
        return createApiResponse(
          HttpStatus.EXPECTATION_FAILED,
          FAIELD_RESPONSE,
          BUCKET_CATEGORY_NOT_FOUND,
        );
      }

      const createBucketPriceSettings = new this.bucketPriceSettingModel(
        createBucketPriceSettingDto,
      );
      await createBucketPriceSettings.save();

      return createApiResponse(
        HttpStatus.CREATED,
        SUCCESS_RESPONSE,
        BUCKET_PRICE_SETTINGS_CREATED_SUCCESS,
        createBucketPriceSettings,
      );
    } catch (err) {
      return createApiResponse(
        HttpStatus.EXPECTATION_FAILED,
        FAIELD_RESPONSE,
        BUCKET_PRICE_SETTINGS_CREATED_FAILED,
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
        const allFields = Object.keys(this.bucketPriceSettingModel.schema.obj);

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

      const totalResult =
        await this.bucketPriceSettingModel.aggregate(pipeline);
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

      const data = await this.bucketPriceSettingModel.aggregate(pipeline);

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

  async findOne(id: any) {
    try {
      const data = await this.bucketPriceSettingModel.findById(id).exec();
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

  async findByCategory(id: any) {
    try {
      const data = await this.bucketPriceSettingModel
        .find({ categoryId: id })
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

  async update(
    id: any,
    updateBucketPriceSettingDto: UpdateBucketPriceSettingDto,
  ) {
    try {
      const data = await this.bucketPriceSettingModel
        .findByIdAndUpdate(id, updateBucketPriceSettingDto, { new: true })
        .exec();
      return createApiResponse(
        HttpStatus.OK,
        SUCCESS_RESPONSE,
        DATA_FOUND,
        data,
      );
    } catch (error) {
      return createApiResponse(
        HttpStatus.BAD_REQUEST,
        FAIELD_RESPONSE,
        SOMETHING_WENT_WRONG,
        error,
      );
    }
  }

  async remove(id: any) {
    try {
      const data = await this.bucketPriceSettingModel
        .findByIdAndDelete(id)
        .exec();
      if (data) {
        return createApiResponse(
          HttpStatus.OK,
          SUCCESS_RESPONSE,
          DATA_FOUND,
          data,
        );
      }
      return createApiResponse(
        HttpStatus.NOT_FOUND,
        FAIELD_RESPONSE,
        NO_DATA_FOUND,
      );
    } catch (error) {
      return createApiResponse(
        HttpStatus.BAD_REQUEST,
        FAIELD_RESPONSE,
        SOMETHING_WENT_WRONG,
        error,
      );
    }
  }
}
