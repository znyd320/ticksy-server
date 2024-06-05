import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { InjectModel, MongooseOptionsFactory } from '@nestjs/mongoose';
import { FilterQuery, Model, MongooseQueryOptions, Types } from 'mongoose';
import {
  DATA_FOUND,
  FAIELD_RESPONSE,
  NO_DATA_FOUND,
  ORDER_IS_NOT_BELONG_TO_YOU,
  ORDER_IS_NOT_COMPLETE_YET,
  ORDER_NOT_FOUND,
  REVIEW_ALREADY_EXIST,
  REVIEW_CREATED_FAILED,
  REVIEW_CREATED_SUCCESSFULLY,
  SOMETHING_WENT_WRONG,
  SUCCESS_RESPONSE,
} from '../../common/constants';
import { createApiResponse } from '../../common/constants/create-api.response';
import { SortBy } from '../../common/enum/enum-sort-by';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { Review } from '../entities/review.entity';
import { SurprisedBucktService } from 'src/surprised-bucket/service/surprised-buckt.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { OrderService } from 'src/order/service/order.service';
import { Order } from 'src/order/entities/order.entity';
import { OrderStatus } from 'src/common/enum';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name)
    private readonly reviewModel: Model<Review>,
  ) {}

  async create(createReviewDto: CreateReviewDto) {
    try {
      const createReview = new this.reviewModel(createReviewDto);
      await createReview.save();

      return createApiResponse(
        HttpStatus.CREATED,
        SUCCESS_RESPONSE,
        REVIEW_CREATED_SUCCESSFULLY,
        createReview,
      );
    } catch (err) {
      return createApiResponse(
        HttpStatus.EXPECTATION_FAILED,
        FAIELD_RESPONSE,
        REVIEW_CREATED_FAILED,
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
        const allFields = Object.keys(this.reviewModel.schema.obj);

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

      // Avg ratting and other calculation
      pipeline.push({
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          count1: {
            $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] },
          },
          count2: {
            $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] },
          },
          count3: {
            $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] },
          },
          count4: {
            $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] },
          },
          count5: {
            $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] },
          },
        },
      });

      pipeline.push({ $count: 'total' });

      const totalResult = await this.reviewModel.aggregate(pipeline);
      const total = totalResult.length > 0 ? totalResult[0].total : 0;

      pipeline.pop();

      // Avg Ratting Infos
      pipeline.push({
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          count1: {
            $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] },
          },
          count2: {
            $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] },
          },
          count3: {
            $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] },
          },
          count4: {
            $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] },
          },
          count5: {
            $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] },
          },
        },
      });

      const rattingCounts = await this.reviewModel.aggregate(pipeline);

      pipeline.pop();

      const startIndex = (page - 1) * limit;
      pipeline.push({ $skip: startIndex });
      pipeline.push({ $limit: parseInt(limit.toString(), 10) });

      const sortStage: any = {};
      sortStage[order] = sort === 'desc' ? -1 : 1;
      pipeline.push({ $sort: sortStage });

      const data = await this.reviewModel.aggregate(pipeline);

      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;
      const nextPage = hasNextPage ? Number(page) + 1 : null;
      const prevPage = hasPrevPage ? Number(page) - 1 : null;

      if (data.length > 0) {
        return createApiResponse(HttpStatus.OK, SUCCESS_RESPONSE, DATA_FOUND, {
          data,
          averageRating: rattingCounts[0]?.averageRating,
          ratingCounts: {
            count1: rattingCounts[0]?.count1,
            count2: rattingCounts[0]?.count2,
            count3: rattingCounts[0]?.count3,
            count4: rattingCounts[0]?.count4,
            count5: rattingCounts[0]?.count5,
          },
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

  async findOne(id: string) {
    try {
      const data = await this.reviewModel.findById(id).exec();
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

  // Query to get one of the document
  async findOneByQuery(query: FilterQuery<Review>) {
    return this.reviewModel.findOne(query).exec();
  }

  async findByQuery(query: FilterQuery<Review>) {
    return this.reviewModel.find(query).exec();
  }

  async update(id: string, updateReviewDto: UpdateReviewDto) {
    try {
      const data = await this.reviewModel
        .findByIdAndUpdate(id, updateReviewDto, { new: true })
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
      const data = await this.reviewModel.findByIdAndDelete(id).exec();
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
    bucketId: string;
  }): Promise<any> {
    try {
      const pipeline: any[] = [];
      const matchStage: any = {};

      if (bucketId) {
        bucketId = bucketId.toString();
        matchStage.bucketId = {
          $in: [bucketId, new Types.ObjectId(bucketId)],
        };
      }

      if (search) {
        const searchRegex = new RegExp(search, 'i');
        const allFields = Object.keys(this.reviewModel.schema.obj);

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

      const totalResult = await this.reviewModel.aggregate(pipeline);
      const total = totalResult.length > 0 ? totalResult[0].total : 0;

      pipeline.pop();

      // Avg Ratting Infos
      pipeline.push({
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          count1: {
            $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] },
          },
          count2: {
            $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] },
          },
          count3: {
            $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] },
          },
          count4: {
            $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] },
          },
          count5: {
            $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] },
          },
        },
      });

      const rattingCounts = await this.reviewModel.aggregate(pipeline);

      pipeline.pop();

      const startIndex = (page - 1) * limit;

      pipeline.push(
        { $skip: startIndex },
        { $limit: parseInt(limit.toString(), 10) },
      );

      const sortStage: any = {};
      sortStage[order] = sort === 'desc' ? -1 : 1;
      pipeline.push({ $sort: sortStage });

      const data = await this.reviewModel.aggregate(pipeline);

      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;
      const nextPage = hasNextPage ? Number(page) + 1 : null;
      const prevPage = hasPrevPage ? Number(page) - 1 : null;

      if (data.length > 0) {
        return createApiResponse(HttpStatus.OK, SUCCESS_RESPONSE, DATA_FOUND, {
          data,
          averageRating: rattingCounts[0]?.averageRating,
          ratingCounts: {
            count1: rattingCounts[0]?.count1,
            count2: rattingCounts[0]?.count2,
            count3: rattingCounts[0]?.count3,
            count4: rattingCounts[0]?.count4,
            count5: rattingCounts[0]?.count5,
          },
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
}
