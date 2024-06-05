import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  BUCKET_ALREADY_EXIST_IN_WISHLIST,
  BUCKET_DELETE_SUCCESS_FROM_WISHLIST,
  DATA_FOUND,
  FAIELD_RESPONSE,
  NO_DATA_FOUND,
  SOMETHING_WENT_WRONG,
  SUCCESS_RESPONSE,
  WISH_LIST_CREATED_FAILED,
  WISH_LIST_CREATED_SUCCESSFULLY,
} from '../../common/constants';
import { createApiResponse } from '../../common/constants/create-api.response';
import { SortBy } from '../../common/enum/enum-sort-by';
import { CreateWishListDto } from '../dto/create-wish-list.dto';
import { WishList } from '../entities/wish-list.entity';

@Injectable()
export class WishListService {
  constructor(
    @InjectModel(WishList.name)
    private readonly wishListModel: Model<WishList>,
  ) {}

  async create(createWishListDto: CreateWishListDto, userInfo: any) {
    try {
      const { ObjectId } = Types;

      const exists = await this.wishListModel.exists({
        $and: [
          { userInfo: new ObjectId(userInfo.sub) },
          { bucket: new ObjectId(createWishListDto.bucket) },
        ],
      });

      if (exists) {
        return createApiResponse(
          HttpStatus.EXPECTATION_FAILED,
          FAIELD_RESPONSE,
          WISH_LIST_CREATED_FAILED,
          BUCKET_ALREADY_EXIST_IN_WISHLIST,
        );
      }

      const createdWishList = await this.wishListModel.create({
        userInfo: new ObjectId(userInfo.sub),
        bucket: new ObjectId(createWishListDto.bucket),
      });

      const populatedWishList = await this.wishListModel
        .findById(createdWishList._id)
        .populate('bucket')
        .exec();

      populatedWishList['wishlistDoc'] = createdWishList;
      populatedWishList['isWishlisted'] = true;

      return createApiResponse(
        HttpStatus.CREATED,
        SUCCESS_RESPONSE,
        WISH_LIST_CREATED_SUCCESSFULLY,
        populatedWishList,
      );
    } catch (err) {
      return createApiResponse(
        HttpStatus.EXPECTATION_FAILED,
        FAIELD_RESPONSE,
        WISH_LIST_CREATED_FAILED,
        err.message,
      );
    }
  }

  async findAll(
    userId: string,
    page: number,
    limit: number,
    order: string,
    sort: SortBy,
    search: string,
    startDate: Date,
    endDate: Date,
  ) {
    try {
      const { ObjectId } = Types;
      const pipeline: any[] = [];
      const matchStage: any = {};

      if (search) {
        const searchRegex = new RegExp(search, 'i');
        const allFields = Object.keys(this.wishListModel.schema.obj);

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

      // Single User Quary
      if (userId) {
        matchStage.userInfo = new ObjectId(userId);
      }

      if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
      }

      // Populate the bucket
      pipeline.push(
        {
          $addFields: {
            wishlistDoc: '$$ROOT',
          },
        },
        {
          $addFields: {
            isWishlisted: true,
          },
        },
      );

      pipeline.push(
        {
          $lookup: {
            from: 'surprisedbuckets',
            localField: 'bucket',
            foreignField: '_id',
            as: 'bucket',
          },
        },
        {
          $addFields: {
            bucket: { $arrayElemAt: ['$bucket', 0] },
          },
        },
      );

      pipeline.push({ $count: 'total' });

      const totalResult = await this.wishListModel.aggregate(pipeline);
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

      const data = await this.wishListModel.aggregate(pipeline);

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

  async remove(id: string, userInfo: any) {
    try {
      const { ObjectId } = Types;
      const userid = userInfo.sub.toString();

      const wishlist = await this.wishListModel
        .findOneAndDelete({
          _id: new ObjectId(id),
          userInfo: new ObjectId(userid),
        })
        .populate('bucket')
        .exec();

      if (wishlist) {
        return createApiResponse(
          HttpStatus.OK,
          SUCCESS_RESPONSE,
          BUCKET_DELETE_SUCCESS_FROM_WISHLIST,
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
