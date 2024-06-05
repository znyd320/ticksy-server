import { HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ResourceDeleteService } from '../../common/module/resource-delete/resource-delete.service';
import {
  parseStringToArrayOfObjects,
  removeEmptyEntityFromObject,
} from '../../common/utils/object-modification';
import {
  DATA_FOUND,
  FAIELD_RESPONSE,
  NO_DATA_FOUND,
  PRO_USER_FINANCE_NOT_EXIST,
  SOMETHING_WENT_WRONG,
  SUCCESS_RESPONSE,
  SURPRISED_BUCKET_CREATED_FAILED,
  SURPRISED_BUCKET_CREATED_SUCCESSFULLY,
  SURPRISED_BUCKET_IMAGE_LIMIT_EXCEED,
  SURPRISED_BUCKET_IMAGE_NOT_FOUND_ON_THIS_BUCKET,
} from '../../common/constants';
import { createApiResponse } from '../../common/constants/create-api.response';
import { SortBy } from '../../common/enum/enum-sort-by';
import { MAX_SURPRISED_BUCKET_IMAGE_LIMIT } from '../constants/buckt_config';
import { CreateSurprisedBucktDto } from '../dto/create-surprised-buckt.dto';
import { DeleteSurprisedBucktImageDto } from '../dto/delete-surprised-buckt-image.dto';
import { UpdateSurprisedBucktDto } from '../dto/update-surprised-buckt.dto';
import { SurprisedBucket } from '../entities/surprised-bucket.entity';
import { ProUserFinanceService } from '../../pro-user-finance/service/pro-user-finance.service';
import { ReviewService } from 'src/review/service/review.service';

@Injectable()
export class SurprisedBucktService {
  constructor(
    @InjectModel(SurprisedBucket.name)
    private readonly surprisedBucketModel: Model<SurprisedBucket>,
    private readonly resourceDeleteService: ResourceDeleteService,
    @Inject(forwardRef(() => ProUserFinanceService))
    private readonly proUserFinanceService: ProUserFinanceService,
    private readonly reviewService: ReviewService,
  ) {}

  async create(
    createSurprisedBucktDto: CreateSurprisedBucktDto,
    bucketImages: Express.Multer.File,
  ) {
    try {
      const senitaizedCreateSuprisedBucktDto: any = removeEmptyEntityFromObject(
        createSurprisedBucktDto,
      );

      const proUserFinanceId = senitaizedCreateSuprisedBucktDto.proUserDetails;
      const isProUserExist =
        await this.proUserFinanceService.isExists(proUserFinanceId);
      if (!isProUserExist) {
        return createApiResponse(
          HttpStatus.EXPECTATION_FAILED,
          FAIELD_RESPONSE,
          PRO_USER_FINANCE_NOT_EXIST,
        );
      }

      let weekDays: any;
      let category: any;
      if (
        senitaizedCreateSuprisedBucktDto?.weekDays &&
        typeof senitaizedCreateSuprisedBucktDto.weekDays == 'string'
      ) {
        weekDays = parseStringToArrayOfObjects(
          senitaizedCreateSuprisedBucktDto.weekDays,
        );
      }

      if (
        senitaizedCreateSuprisedBucktDto?.category &&
        typeof senitaizedCreateSuprisedBucktDto.category == 'string'
      ) {
        category = senitaizedCreateSuprisedBucktDto.category;
        category = category.split(',').map((item: string) => item.trim());
      }

      const createdSurprisedBucket = new this.surprisedBucketModel({
        ...senitaizedCreateSuprisedBucktDto,
        weekDays,
        category,
      });

      // Add image if exist
      if (bucketImages != undefined || bucketImages != null) {
        const bucketImageFileNames = `uploads/surprise-bucket-image/${bucketImages.filename}`;
        createdSurprisedBucket.bucketImages = bucketImageFileNames;
      }

      await createdSurprisedBucket.save();
      return createApiResponse(
        HttpStatus.CREATED,
        SUCCESS_RESPONSE,
        SURPRISED_BUCKET_CREATED_SUCCESSFULLY,
        createdSurprisedBucket,
      );
    } catch (err) {
      return createApiResponse(
        HttpStatus.EXPECTATION_FAILED,
        FAIELD_RESPONSE,
        SURPRISED_BUCKET_CREATED_FAILED,
        err.message,
      );
    }
  }

  async findAll({
    page,
    limit,
    order,
    sort,
    search,
    startDate,
    endDate,
    weekDay = undefined,
    categories = undefined,
    restorant = undefined,
    user = undefined,
  }: {
    page: number;
    limit: number;
    order: string;
    sort: SortBy;
    search: string;
    startDate: Date;
    endDate: Date;
    weekDay?: string;
    categories?: string;
    restorant?: string;
    user?: any;
  }): Promise<any> {
    try {
      const pipeline: any[] = [];
      const matchStage: any = {};

      if (search) {
        const searchRegex = new RegExp(search, 'i');
        const allFields = Object.keys(this.surprisedBucketModel.schema.obj);

        matchStage.$or = allFields.map((field) => ({
          [field]: { $regex: searchRegex },
        }));
      }

      if (categories && categories != '') {
        const categoryArr = categories
          .split(',')
          .map((item: string) => item.trim());
        matchStage.category = { $in: categoryArr };
      }

      if (weekDay && weekDay != '') {
        weekDay = weekDay.toLowerCase();
        weekDay = weekDay.charAt(0).toUpperCase() + weekDay.slice(1);
        matchStage.weekDays = { $elemMatch: { day: weekDay } };
      }

      if (restorant && restorant != '') {
        const restorantArr = restorant
          .split(',')
          .map((item: string) => item.trim());
        matchStage.proUserDetails = { $in: restorantArr };
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
      // Wishlisted or not validation
      pipeline.push(
        {
          $lookup: {
            from: 'wishlists',
            let: { surprisedBucketId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$bucket', '$$surprisedBucketId'] },
                      { $eq: ['$userInfo', new Types.ObjectId(user?.sub)] },
                    ],
                  },
                },
              },
              { $limit: 1 },
            ],
            as: 'wishlistDoc',
          },
        },
        {
          $addFields: {
            isWishlisted: { $gt: [{ $size: '$wishlistDoc' }, 0] },
          },
        },
      );

      pipeline.push({ $count: 'total' });

      const totalResult = await this.surprisedBucketModel.aggregate(pipeline);
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

      const data = await this.surprisedBucketModel.aggregate(pipeline);

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
      console.log(error);
      return createApiResponse(
        HttpStatus.BAD_REQUEST,
        FAIELD_RESPONSE,
        SOMETHING_WENT_WRONG,
        error,
      );
    }
  }

  async findAllReviewsOfSurprisedBuckt({
    page,
    limit,
    order,
    sort,
    search,
    startDate,
    endDate,
    bucketId,
  }: {
    page: number;
    limit: number;
    order: string;
    sort: SortBy;
    search: string;
    startDate: Date;
    endDate: Date;
    bucketId: any;
  }) {
    bucketId = new Types.ObjectId(bucketId);
    return this.reviewService.findAllReviewsOfSurprisedBuckt({
      page,
      limit,
      order,
      sort,
      search,
      startDate,
      endDate,
      bucketId,
    });
  }

  async findOne(id: string, user: any = undefined) {
    try {
      const pipeline: any[] = [
        {
          $match: {
            _id: new Types.ObjectId(id),
          },
        },
        {
          $lookup: {
            from: 'wishlists',
            let: { bucketId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$bucket', '$$bucketId'] },
                      { $eq: ['$userInfo', new Types.ObjectId(user.sub)] },
                    ],
                  },
                },
              },
              { $limit: 1 },
            ],
            as: 'wishlistDoc',
          },
        },
        {
          $addFields: {
            isWishlisted: { $gt: [{ $size: '$wishlistDoc' }, 0] },
          },
        },
      ];

      const data = await this.surprisedBucketModel.aggregate(pipeline).exec();

      if (data && data.length > 0) {
        return createApiResponse(
          HttpStatus.OK,
          SUCCESS_RESPONSE,
          DATA_FOUND,
          data[0],
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

  async findById(id: string | Types.ObjectId) {
    return await this.surprisedBucketModel.findById(id).exec();
  }

  async update(
    id: string,
    updateSurprisedBucktDto: UpdateSurprisedBucktDto,
    uploadedBucketImage: Express.Multer.File,
  ) {
    try {
      let category: any;
      let bucketImages: any;
      const payload: any = {
        ...updateSurprisedBucktDto,
      };

      const prevData = await this.surprisedBucketModel.findById(id).exec();

      if (!prevData) {
        return createApiResponse(
          HttpStatus.NOT_FOUND,
          SUCCESS_RESPONSE,
          NO_DATA_FOUND,
        );
      }

      if (
        updateSurprisedBucktDto?.weekDays &&
        typeof updateSurprisedBucktDto.weekDays == 'string'
      ) {
        payload.weekDays = parseStringToArrayOfObjects(
          updateSurprisedBucktDto.weekDays,
        );
      }

      if (
        updateSurprisedBucktDto?.category &&
        typeof updateSurprisedBucktDto.category == 'string'
      ) {
        category = updateSurprisedBucktDto.category;
        payload.category = category
          .split(',')
          .map((item: string) => item.trim());
      }

      // Add image if exist
      if (uploadedBucketImage != undefined || uploadedBucketImage != null) {
        const bucketImageFileNames = `uploads/surprise-bucket-image/${bucketImages.filename}`;
        payload.bucketImage = bucketImageFileNames;
      }

      const data = await this.surprisedBucketModel.findByIdAndUpdate(
        id,
        payload,
        { new: true },
      );

      return createApiResponse(
        HttpStatus.ACCEPTED,
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
      const data = await this.surprisedBucketModel.findByIdAndDelete(id);

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
        error,
      );
    }
  }

  async removeImage(
    id: string,
    deleteSurprisedBucktImageDto: DeleteSurprisedBucktImageDto,
  ) {
    try {
      const imagePath = deleteSurprisedBucktImageDto.imagePath;
      const data = await this.surprisedBucketModel.findById(id).exec();
      if (!data) {
        return createApiResponse(
          HttpStatus.NOT_FOUND,
          SUCCESS_RESPONSE,
          NO_DATA_FOUND,
        );
      }
      const bucketImages: any = data.bucketImages;
      const index = bucketImages.indexOf(imagePath);
      if (index > -1) {
        this.resourceDeleteService.delete(imagePath);
        bucketImages.splice(index, 1);
        data.bucketImages = bucketImages;
        await data.save();
        return createApiResponse(
          HttpStatus.ACCEPTED,
          SUCCESS_RESPONSE,
          DATA_FOUND,
          data,
        );
      } else {
        return createApiResponse(
          HttpStatus.NOT_FOUND,
          FAIELD_RESPONSE,
          SURPRISED_BUCKET_IMAGE_NOT_FOUND_ON_THIS_BUCKET,
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

  async isExist(id: string) {
    return await this.surprisedBucketModel.exists({ _id: id });
  }
}
