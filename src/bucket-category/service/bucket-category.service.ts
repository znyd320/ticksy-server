import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BUCKET_CATEGORY_CREATED_FAILED,
  BUCKET_CATEGORY_CREATED_SUCCESSFULLY,
  DATA_FOUND,
  FAIELD_RESPONSE,
  NO_DATA_FOUND,
  SOMETHING_WENT_WRONG,
  SUCCESS_RESPONSE,
} from '../../common/constants';
import { createApiResponse } from '../../common/constants/create-api.response';
import { SortBy } from '../../common/enum/enum-sort-by';
import { CreateBucketCategoryDto } from '../dto/create-bucket-category.dto';
import { UpdateBucketCategoryDto } from '../dto/update-bucket-category.dto';
import { BucketCategory } from '../entities/bucket-category.entity';

@Injectable()
export class BucketCategoryService {
  constructor(
    @InjectModel(BucketCategory.name)
    private readonly bucketCategoryModel: Model<BucketCategory>,
  ) {}

  async create(
    createBucketCategoryDto: CreateBucketCategoryDto,
    bucketCategoryImage: Express.Multer.File,
  ) {
    try {
      const createBucketCategory = new this.bucketCategoryModel(
        createBucketCategoryDto,
      );
      if (bucketCategoryImage != undefined || bucketCategoryImage != null) {
        createBucketCategory.bucketCategoryImage = `uploads/bucket-category-image/${bucketCategoryImage.filename}`;
      }

      createBucketCategory.save();

      return createApiResponse(
        HttpStatus.CREATED,
        SUCCESS_RESPONSE,
        BUCKET_CATEGORY_CREATED_SUCCESSFULLY,
        createBucketCategory,
      );
    } catch (err) {
      return createApiResponse(
        HttpStatus.EXPECTATION_FAILED,
        FAIELD_RESPONSE,
        BUCKET_CATEGORY_CREATED_FAILED,
        err.message,
      );
    }
  }

  async dropdown() {
    try {
      const data = await this.bucketCategoryModel.find();
      if (data.length > 0) {
        return createApiResponse(HttpStatus.OK, SUCCESS_RESPONSE, DATA_FOUND, {
          data,
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

  async findAll(
    page: number,
    limit: number,
    order: string,
    sort: SortBy,
    search: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    try {
      const pipeline: any[] = [];
      const matchStage: any = {};

      if (search) {
        const searchRegex = new RegExp(search, 'i');
        const allFields = Object.keys(this.bucketCategoryModel.schema.obj);

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

      const totalResult = await this.bucketCategoryModel.aggregate(pipeline);
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

      const data = await this.bucketCategoryModel.aggregate(pipeline);

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

  async findInfiniteScroll(
    page: number = 1,
    pageSize: number = 10,
    search: string = '',
  ) {
    try {
      const skip = (page - 1) * pageSize;

      const matchStage: any = {};

      if (search) {
        const searchRegex = new RegExp(search, 'i');
        const allFields = Object.keys(this.bucketCategoryModel.schema.obj);

        matchStage.$or = allFields.map((field) => ({
          [field]: { $regex: searchRegex },
        }));
      }

      const bucketCategories = await this.bucketCategoryModel
        .aggregate([
          { $match: matchStage },
          { $skip: skip },
          { $limit: pageSize },
        ])
        .exec();

      const total = await this.bucketCategoryModel.countDocuments(matchStage);

      if (bucketCategories.length > 0) {
        return createApiResponse(HttpStatus.OK, SUCCESS_RESPONSE, DATA_FOUND, {
          data: bucketCategories,
          total,
          page,
          pageSize,
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

  async findOne(id: string) {
    try {
      const data = await this.bucketCategoryModel.findById(id).exec();
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

  update(
    id: string,
    updateBucketCategoryDto: UpdateBucketCategoryDto,
    bucketCategoryImage: Express.Multer.File,
  ) {
    try {
      if (bucketCategoryImage != undefined || bucketCategoryImage != null) {
        updateBucketCategoryDto.bucketCategoryImage =
          bucketCategoryImage.fieldname;
      }
      const data = this.bucketCategoryModel
        .findByIdAndUpdate(id, updateBucketCategoryDto, { new: true })
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

  async remove(id: string) {
    try {
      const data = await this.bucketCategoryModel.findByIdAndDelete(id).exec();
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

  async isExist(id: string) {
    try {
      const data = await this.bucketCategoryModel.exists({ _id: id }).exec();
      if (data) {
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
}
