import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Observable, firstValueFrom } from 'rxjs';
import { OrderStatus, PaymentAccountType, UserRole } from 'src/common/enum';
import { NotificationService } from 'src/notification/service/notification.service';
import { CreateReviewDto } from 'src/review/dto/create-review.dto';
import { ReviewService } from 'src/review/service/review.service';
import {
  FAIELD_RESPONSE,
  ORDER_ALREADY_IN_THIS_PHASE,
  ORDER_NOT_BELONGS_TO_THIS_USER,
  ORDER_NOT_FOUND,
  ORDER_QUANTITY_IS_HIGHER_THEN_AVAILABLE_BAGS,
  ORDER_STATUS_UNKNOWN,
  PRO_USER_FINANCE_NOT_EXIST,
  REVIEW_ALREADY_EXIST,
  REVIEW_GET_SUCCESSFULLY,
  REVIEW_NOT_FOUND,
  SUCCESS_RESPONSE,
  SURPRICE_BAG_NOT_BELONGS_TO_THIS_RESTAURANT,
  SURPRISED_BUCKET_NOT_EXIST,
  USER_NOT_EXIST,
  USER_RESERVE_FUND_NOT_ENOUGH,
  USER_RESERVE_FUND_PAYMENT_COMPLETE,
} from '../../common/constants';
import { createApiResponse } from '../../common/constants/create-api.response';
import { SortBy } from '../../common/enum/enum-sort-by';
import { ProUserFinanceService } from '../../pro-user-finance/service/pro-user-finance.service';
import { SurprisedBucktService } from '../../surprised-bucket/service/surprised-buckt.service';
import { UserService } from '../../user/service/user.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { PaymentIntentDto } from '../dto/payment-intent.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { Order, OrderStatusHistory } from '../entities/order.entity';
import {
  orderCreateProUserNotificationPayload,
  orderCreateUserNotificationPayload,
} from '../interfaces/create-order-push-notification.interface';
import { PaymentStatus } from 'src/common/enum/enum-payment-status';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
    @Inject('ORDER_SERVICE') private readonly client: ClientProxy,
    private readonly userService: UserService,
    private readonly surprisedBucktService: SurprisedBucktService,
    private readonly proUserFinanceService: ProUserFinanceService,
    private readonly reviewService: ReviewService,
    private readonly notificationService: NotificationService,
  ) { }

  async create(createOrderDto: CreateOrderDto) {
    // User Validation
    const userInfo = await this.userService.findById(createOrderDto.orderBy);
    if (!userInfo) {
      return createApiResponse(
        HttpStatus.EXPECTATION_FAILED,
        FAIELD_RESPONSE,
        USER_NOT_EXIST,
      );
    }
    createOrderDto.userDetails = userInfo;

    // Pro User / Restaurant Validation
    const proUserFinanceInfo = await this.proUserFinanceService.findById(
      createOrderDto.restaurantId,
    );
    if (!proUserFinanceInfo) {
      return createApiResponse(
        HttpStatus.EXPECTATION_FAILED,
        FAIELD_RESPONSE,
        PRO_USER_FINANCE_NOT_EXIST,
      );
    }
    createOrderDto.restaurantDetails = proUserFinanceInfo;

    // Bucket Validation
    const surprisedBucktInfo = await this.surprisedBucktService.findById(
      createOrderDto.bucketId,
    );

    if (!surprisedBucktInfo) {
      return createApiResponse(
        HttpStatus.EXPECTATION_FAILED,
        FAIELD_RESPONSE,
        SURPRISED_BUCKET_NOT_EXIST,
      );
    }

    createOrderDto.bucketDetails = surprisedBucktInfo;
    createOrderDto.amount =
      Math.abs(createOrderDto.qty) *
      (surprisedBucktInfo.discountedPrice || surprisedBucktInfo.originalPrice);

    // Quantity Validation
    if (surprisedBucktInfo.numberOfBags < createOrderDto.qty) {
      return createApiResponse(
        HttpStatus.EXPECTATION_FAILED,
        FAIELD_RESPONSE,
        ORDER_QUANTITY_IS_HIGHER_THEN_AVAILABLE_BAGS,
        ORDER_QUANTITY_IS_HIGHER_THEN_AVAILABLE_BAGS,
      );
    }
    const orderPendingHistory: OrderStatusHistory = {
      status: OrderStatus.PENDING,
      remarks: 'Order has been placed',
      time: new Date(),
    };

    createOrderDto.orderStatus = OrderStatus.PENDING;
    createOrderDto.orderStatusHistory = [orderPendingHistory];

    // Save order and return
    let response = this.client.send('create_order', createOrderDto);
    response = await firstValueFrom(response);

    // Notification to user
    const order_user_notify_payload = orderCreateUserNotificationPayload(
      createOrderDto.bucketDetails?.bucketName,
      createOrderDto.orderBy,
      createOrderDto.bucketDetails?.bucketImages,
    );
    this.notificationService.sendNotificationToSpecificUsers(
      order_user_notify_payload,
    );

    // Notification to restoront
    const order_restaurant_notify_payload =
      orderCreateProUserNotificationPayload(
        createOrderDto.bucketDetails?.bucketName,
        createOrderDto.restaurantDetails?.proUserDetails,
        createOrderDto.bucketDetails?.bucketImages,
      );

    this.notificationService.sendNotificationToSpecificUsers(
      order_restaurant_notify_payload,
    );

    return response;
  }

  async paymentIntent(paymentIntent: PaymentIntentDto , userId: string) {
    // Pro User / Restaurant Validation
    const proUserFinanceInfo = await this.proUserFinanceService.findById(
      paymentIntent.restaurantId,
    );

    if (!proUserFinanceInfo)
      return new HttpException(
        PRO_USER_FINANCE_NOT_EXIST,
        HttpStatus.EXPECTATION_FAILED,
      );

    // Bucket Validation
    const surprisedBucktInfo = await this.surprisedBucktService.findById(
      paymentIntent.bucketId,
    );

    if (!surprisedBucktInfo)
      return new HttpException(
        SURPRISED_BUCKET_NOT_EXIST,
        HttpStatus.EXPECTATION_FAILED,
      );

    if (surprisedBucktInfo.numberOfBags < paymentIntent.qty)
      return new HttpException(
        ORDER_QUANTITY_IS_HIGHER_THEN_AVAILABLE_BAGS,
        HttpStatus.EXPECTATION_FAILED,
      );

    if (
      surprisedBucktInfo.proUserDetails.toString() !==
      paymentIntent.restaurantId
    )
      return new HttpException(
        SURPRICE_BAG_NOT_BELONGS_TO_THIS_RESTAURANT,
        HttpStatus.EXPECTATION_FAILED,
      );

    let amount =
      surprisedBucktInfo.discountedPrice || surprisedBucktInfo.originalPrice;
    amount = amount * paymentIntent.qty;
    amount = Math.round(amount * 100) / 100;

    switch (paymentIntent.paymentAccountType) {
      case PaymentAccountType.STRIPE:
        return this.client.send('payment_intent', { amount });
      case PaymentAccountType.RESERVED:
        return this.paymentWithWallet(amount, userId);
    }

  }


  async paymentWithWallet(amount: number, userId: string) {
    try {
      amount = Number(amount)
      const user = await this.userService.findById(new Types.ObjectId(userId));
      if (!user) return new HttpException(USER_NOT_EXIST, HttpStatus.BAD_REQUEST);
      if (user.reserveFund < amount) return new HttpException(USER_RESERVE_FUND_NOT_ENOUGH, HttpStatus.BAD_REQUEST);
      await this.userService.decreaseReserveFund(amount, userId);

      const transectionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      let responsePayload = {
        status: PaymentStatus.SUCCESS,
        amount,
        transectionId,
        time: new Date(),
      }

      return createApiResponse(HttpStatus.OK, SUCCESS_RESPONSE, USER_RESERVE_FUND_PAYMENT_COMPLETE, responsePayload);

    } catch (err) {
      return createApiResponse(HttpStatus.BAD_REQUEST, FAIELD_RESPONSE, err.message);
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
    user,
    restaurant,
  }: {
    page: number;
    limit: number;
    order: string;
    sort: SortBy;
    search: string;
    startDate: Date;
    endDate: Date;
    user?: any;
    restaurant?: string;
  }): Promise<any> {
    const orderObserver = this.client.send('find_orders', {
      page,
      limit,
      order,
      sort,
      search,
      startDate,
      endDate,
      user,
      restaurant,
    });

    const result = await firstValueFrom(orderObserver);

    if (!user) return result;

    // If user exist then append the is review able field
    const userId = user.sub;
    const deliveredOrders =
      result?.payload?.data?.filter(
        (order: Order) => order.orderStatus === OrderStatus.DELIVERED,
      ) || [];

    const allReviews = await this.reviewService.findByQuery({
      bucketId: {
        $in: deliveredOrders
          .map((order: Order) => [
            order.bucketId,
            new Types.ObjectId(order.bucketId),
          ])
          .flat(),
      },
      reviewBy: { $in: [userId, new Types.ObjectId(userId)] },
    });

    result.payload.data = result.payload.data.map((order: Order) => ({
      ...order,
      isReviewAble:
        order.orderStatus === OrderStatus.DELIVERED &&
        !allReviews.some(
          (review) => review.bucketId.toString() === order.bucketId.toString(),
        ),
    }));

    return result;
  }

  async findOne(id: string) {
    const orderObservable: Observable<Order> = this.client.send(
      'find_order',
      id,
    );
    const result = await firstValueFrom(orderObservable);
    return result;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    return this.client.send('update_order', { id, updateOrderDto });
  }

  async updateStatus(
    id: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
    userId: string,
  ) {
    // if (
    //   Object.keys(OrderStatus).includes(
    //     updateOrderStatusDto.orderStatus.toUpperCase(),
    //   ) === false
    // )
    //   throw new HttpException(
    //     ORDER_STATUS_UNKNOWN,
    //     HttpStatus.EXPECTATION_FAILED,
    //   );

    const currentUser = await this.userService.findById(
      new Types.ObjectId(userId),
    );
    if (!currentUser)
      throw new HttpException(USER_NOT_EXIST, HttpStatus.EXPECTATION_FAILED);

    const { payload: currentOrder }: any = await this.findOne(id);

    if (Array.isArray(currentOrder) || !currentOrder)
      throw new HttpException(ORDER_NOT_FOUND, HttpStatus.EXPECTATION_FAILED);

    const AdministrationRoles = [
      UserRole.ADMINISTRATOR,
      UserRole.SYSTEM_ADMINISTRATOR,
    ];
    const RestaurantRoles = [UserRole.PRO_USER];
    const CustomerRoles = [UserRole.USER];

    const isAdmin = currentUser.roles.some((role: UserRole) =>
      AdministrationRoles.includes(role),
    );
    const isRestaurant = currentUser.roles.some((role: UserRole) =>
      RestaurantRoles.includes(role),
    );
    const isCustomer = currentUser.roles.some((role: UserRole) =>
      CustomerRoles.includes(role),
    );

    if (!isAdmin && isRestaurant) {
      const { payload } = await this.proUserFinanceService.findByUserId(userId);
      const isOrderBelongsToRestaurant =
        currentOrder.restaurantId.toString() === payload?._id?.toString();
      const isOrderBelongsToThisUser =
        currentOrder.orderBy.toString() === userId;
      if (!isOrderBelongsToRestaurant && !isOrderBelongsToThisUser)
        throw new HttpException(
          ORDER_NOT_BELONGS_TO_THIS_USER,
          HttpStatus.EXPECTATION_FAILED,
        );
    } else if (!isAdmin && !isRestaurant && isCustomer) {
      if (currentOrder.orderBy.toString() !== userId)
        throw new HttpException(
          ORDER_NOT_BELONGS_TO_THIS_USER,
          HttpStatus.EXPECTATION_FAILED,
        );
    }

    // Update Also Order History
    const orderHistory: OrderStatusHistory = {
      status: updateOrderStatusDto.orderStatus as OrderStatus,
      remarks: updateOrderStatusDto.remarks,
      time: new Date(),
    };

    const latestOrderHistory =
      currentOrder.orderStatusHistory[
      currentOrder.orderStatusHistory.length - 1
      ];
    if (
      latestOrderHistory.status.toUpperCase() ===
      updateOrderStatusDto.orderStatus.toUpperCase()
    ) {
      throw new HttpException(
        ORDER_ALREADY_IN_THIS_PHASE,
        HttpStatus.EXPECTATION_FAILED,
      );
    }

    if (!currentOrder.orderStatusHistory.includes(OrderStatus.CANCELLED_BY_RESTURANT_OWNER)) {
      if (orderHistory.status == OrderStatus.CANCELLED_BY_RESTURANT_OWNER) {
        await this.userService.increseReserveFund(currentOrder);
      }
    }

    // Update Order Status
    const orderObserver = this.client.send('update_order', {
      id,
      updateOrderDto: {
        orderStatus: updateOrderStatusDto.orderStatus,
        orderStatusHistory: [...currentOrder.orderStatusHistory, orderHistory],
      },
    });

    const result = await firstValueFrom(orderObserver);
    return result;
  }

  async remove(id: string) {
    return this.client.send('remove_order', id);
  }

  // routes with ref of order with other module
  async createReview(id: string, createReviewDto: CreateReviewDto) {
    const { payload: currentOrder }: any = await this.findOne(id);

    const bucketId = currentOrder.bucketId.toString();
    const reviewBy = createReviewDto.reviewBy.toString();

    const currentReview = await this.reviewService.findOneByQuery({
      bucketId: { $in: [bucketId, new Types.ObjectId(bucketId)] },
      reviewBy: { $in: [reviewBy, new Types.ObjectId(reviewBy)] },
    });

    if (currentReview)
      throw new HttpException(
        REVIEW_ALREADY_EXIST,
        HttpStatus.EXPECTATION_FAILED,
      );
    if (!currentOrder)
      throw new HttpException(ORDER_NOT_FOUND, HttpStatus.EXPECTATION_FAILED);

    if (currentOrder.orderBy.toString() !== reviewBy.toString())
      throw new HttpException(
        ORDER_NOT_BELONGS_TO_THIS_USER,
        HttpStatus.EXPECTATION_FAILED,
      );
    createReviewDto.orderId = currentOrder._id;
    createReviewDto.restaurantId = currentOrder.restaurantId;
    createReviewDto.bucketId = currentOrder.bucketId;
    return this.reviewService.create(createReviewDto);
  }

  async getReviewByOrder(id: string, user: any) {
    const { payload: currentOrder }: any = await this.findOne(id);

    if (!currentOrder || (Array.isArray(currentOrder) && !currentOrder.length))
      throw new HttpException(ORDER_NOT_FOUND, HttpStatus.NOT_FOUND);
    const result = await this.reviewService.findOneByQuery({
      orderId: { $in: [id, new Types.ObjectId(id)] },
      reviewBy: { $in: [user.sub, new Types.ObjectId(user.sub)] },
    });

    if (!result)
      throw new HttpException(REVIEW_NOT_FOUND, HttpStatus.NOT_FOUND);
    return createApiResponse(
      HttpStatus.OK,
      SUCCESS_RESPONSE,
      REVIEW_GET_SUCCESSFULLY,
      result,
    );
  }

  // Helpers
  async findOrderByUserAndBucketId(
    userId: string | Types.ObjectId,
    bucketId: string | Types.ObjectId,
  ) {
    return this.client.send('get_order_by_user_and_bucket', {
      userId,
      bucketId,
    });
  }

  async getDashbordCounting() {
    const dashbordCounting = this.client.send('get-dashbord-counting', {});
    const data = await firstValueFrom(dashbordCounting);
    return data;
  }
  async getYearlyOrderReport(year: number) {
    const yearlyReport = this.client.send('get-yearly-order-report', year);
    const data = await firstValueFrom(yearlyReport);
    return data;
  }
}
