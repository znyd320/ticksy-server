import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model, Types } from 'mongoose';
import { UserRole } from 'src/common/enum';
import { NotificationService } from 'src/notification/service/notification.service';
import { CreateSystemAdministratorDto } from '../../auth/mail-connection/dto/create-system-administrator.dto';
import { createApiResponse } from '../../common/constants/create-api.response';
import {
  DATA_FOUND,
  FAIELD_RESPONSE,
  NO_DATA_FOUND,
  SOMETHING_WENT_WRONG,
  SUCCESS_RESPONSE,
  USER_ALREADY_EXIST,
  USER_NOT_EXIST,
  USER_RESERVE_FUND_NOT_ENOUGH,
} from '../../common/constants/message.response';
import { SortBy } from '../../common/enum/enum-sort-by';
import { ResourceDeleteService } from '../../common/module/resource-delete/resource-delete.service';
import { removeEmptyEntityFromObject } from '../../common/utils/object-modification';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import { CreateOrderDto } from 'src/order/dto/create-order.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private jwtService: JwtService,
    private resourceDeleteService: ResourceDeleteService,
    // @Inject(forwardRef(() => NotificationService))
  ) { }

  async createSystemAdministrator(
    createSystemAdministrator: CreateSystemAdministratorDto,
  ) {
    const userExist = await this.checkUserByEmail(
      createSystemAdministrator.email,
    );

    if (userExist.length > 0)
      throw new HttpException(USER_ALREADY_EXIST, HttpStatus.CONFLICT);

    const encryptedPassword = await this.hashPassword(
      createSystemAdministrator.password,
    );

    const user = new this.userModel();
    user.fullName = createSystemAdministrator.fullName;
    user.email = createSystemAdministrator.email;
    user.password = encryptedPassword;
    user.roles = createSystemAdministrator.roles;

    return user.save();
  }

  findByEmail(email: string) {
    return this.userModel.findOne({ email: email }).select('-password');
  }

  async findAll(
    page: number,
    limit: number,
    order: string,
    sort: SortBy,
    search: string,
    fields: string,
    startDate: Date,
    endDate: Date,
  ) {
    try {
      const pipeline: any[] = [];
      const matchStage: any = {};
      const additionalFields: any = {};

      if (fields) {
        const fieldsArray = fields.split(',');
        fieldsArray.forEach((field) => {
          const firstCarecter = field.trim().charAt(0);
          if (firstCarecter == '-') {
            additionalFields[field.trim().slice(1)] = null;
          } else {
            additionalFields[field.trim()] = 1;
          }
        });
      }

      if (search) {
        const searchRegex = new RegExp(search, 'i');
        const allFields = Object.keys(this.userModel.schema.obj);

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

      // console.log(additionalFields)

      pipeline.push({
        $project: {
          _id: 1,
          fullName: 1,
          email: 1,
          mobileNumber: { $ifNull: ['$mobileNumber', null] },
          address: { $ifNull: ['$address', null] },
          status: { $ifNull: ['$status', null] },
          roles: 1,
          signinBy: 1,
          country: 1,
          profileImage: { $ifNull: ['$profileImage', null] },
          sentMail: 1,
          token: 1,
          createdAt: 1,
          updatedAt: 1,
          ...additionalFields,
        },
      });

      pipeline.push({ $count: 'total' });

      const totalResult = await this.userModel.aggregate(pipeline);
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

      const data = await this.userModel.aggregate(pipeline);

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

  async findOne(id: string) {
    try {
      const data = await this.userModel.findById(id).select('-password').exec();
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
    updateUserDto: UpdateUserDto,
    profileImage: Express.Multer.File = null,
  ) {
    try {
      updateUserDto = removeEmptyEntityFromObject(updateUserDto);
      if (updateUserDto?.password) {
        updateUserDto.password = await this.hashPassword(
          updateUserDto.password,
        );
      }
      const user = await this.userModel.findById(id);

      if (
        !!user?.profileImage &&
        (profileImage != undefined || profileImage != null)
      ) {
        const prevProfileImage = user.profileImage;
        this.deleteProfileImage(prevProfileImage);
      }

      if (profileImage != undefined || profileImage != null) {
        updateUserDto.profileImage = `uploads/user-profile-image/${profileImage.filename}`;
      }

      delete updateUserDto?.reserveFund;

      return await this.userModel
        .findByIdAndUpdate(id, updateUserDto)
        .select('-password')
        .exec();
    } catch (err) {
      if (profileImage != undefined || profileImage != null) {
        const path = `uploads/user-profile-image/${profileImage.filename}`;
        this.deleteProfileImage(path);
      }
      console.log(err);
      throw err;
    }
  }

  async increseReserveFund(order: any) {
    try {
      let userId = order.orderBy.toString();
      let amount = order?.amount ? Number(order?.amount) : 0;
      amount = Math.abs(amount);

      return await this.userModel.findByIdAndUpdate(
        userId,
        { $inc: { reserveFund: amount } },
        { new: true }
      );

    } catch (err) {
      throw err;
    }
  }

  async decreaseReserveFund(amount : number, userId : string) {
    try {
      amount = Math.abs(amount) * -1;

      return await this.userModel.findByIdAndUpdate(
        userId,
        { $inc: { reserveFund: amount } },
        { new: true },
      );
    } catch (err) {
      throw err;
    }
  }


  private async deleteProfileImage(path) {
    try {
      return await this.resourceDeleteService.delete(path);
    } catch (err) {
      throw err;
    }
  }

  async remove(id: string) {
    try {
      const data = await this.userModel
        .findByIdAndDelete(id)
        .select('-password')
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

  async checkUserByEmail(email: string) {
    return await this.userModel.find({ email });
  }

  async getUserByEmailWithPassword(email: string) {
    return await this.userModel.find({ email }).select('+password');
  }

  async checkUserByRoles(roles) {
    return await this.userModel.find({ roles });
  }

  async isExist(id: any) {
    return await this.userModel.exists({ _id: id });
  }

  async findById(id: Types.ObjectId) {
    return await this.userModel.findById(id).exec();
  }

  async hashPassword(password) {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
  }

  async getAccessToken(response) {
    const payload = {
      sub: (await response)._id,
      fullName: (await response).fullName,
      email: (await response).email,
      roles: (await response).roles,
    };
    const access_token = await this.jwtService.signAsync(payload);
    return { data: payload, access_token };
  }

  async getAccessTokenByUserID(id: string) {
    try{
      const response = await this.userModel.findById(id).exec();
      const payload = {
        sub: response._id,
        fullName: response.fullName,
        email: response.email,
        roles: response.roles,
      };
      
      const access_token = await this.jwtService.signAsync(payload);
      return { data: payload, access_token };

    }catch(err){
      throw err.message;
    }
  }

  async checkSystemAdministratorUser(
    createSystemAdministrator: CreateSystemAdministratorDto,
  ) {
    return await this.checkUserByRoles(createSystemAdministrator.roles);
  }

  async createUser(createUserData: CreateUserDto) {
    const userExist = await this.checkUserByEmail(createUserData.email);

    if (userExist.length > 0)
      throw new HttpException(USER_ALREADY_EXIST, HttpStatus.CONFLICT);

    const encryptedPassword = await this.hashPassword(createUserData.password);
    const user = new this.userModel({
      ...createUserData,
    });
    user.fullName = createUserData.fullName;
    user.email = createUserData.email;
    user.password = encryptedPassword;
    user.roles = [UserRole.USER];

    return user.save();
  }

  async getDashbordCounting() {
    const result = await this.userModel.countDocuments({});
    return result;
  }

  async findAllUserForNotify(user_ids: string[]) {
    let userIds: any = [...user_ids];
    userIds = userIds.map((item: string) => {
      return new Types.ObjectId(item);
    });
    return await this.userModel
      .find({ _id: { $in: userIds } })
      .select('_id token email allowPushNotification allowEmailNotification');
  }

  // crate google auth user
  async createGoogleAuthUser({ email, fullName, password, profileImage }) {
    // hash password
    const encryptedPassword = await this.hashPassword(password);

    // create user
    try {
      const user = new this.userModel({
        email,
        fullName,
        password: encryptedPassword,
        roles: [UserRole.USER],
        profileImage,
      });

      return user.save();
    } catch (error) {
      return error;
    }
  }


  async IsUserIdsExist(userIds: string[]): Promise<{ [key: string]: boolean }[]> {
    const objectIds = userIds.map((id) => new Types.ObjectId(id));

    const existingUsers = await this.userModel.find({
      _id: { $in: objectIds },
    }).select('_id').exec();

    const existingUserIds = existingUsers.map((user) => user._id.toString());

    return userIds.map((id) => {
      return {
        [id]: existingUserIds.includes(id),
      }
    });
  }




}
