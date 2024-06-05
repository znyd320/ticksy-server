import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { AuthGuard, RolesGuard } from '../../common/guard';

import { GetSessionUser } from '../../common/decorators/session-user.decorator';
import { ValidateDtoPipe } from '../../common/pipe/validate-dto.pipe';
import { AddOrderStatusHistoryDto } from '../dto/add-order-status-history.dto';
import { CreateOrderDto } from '../dto/create-order.dto';
import { PaymentIntentDto } from '../dto/payment-intent.dto';
import { RemoveOrderStatusHistoryDto } from '../dto/remove-order-status-history.dto';
import { UpdateOrderStatusHistoryDto } from '../dto/update-order-status-history.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { OrderService } from '../service/order.service';
import { Types } from 'mongoose';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { CreateReviewDto } from '../../review/dto/create-review.dto';

@Controller('order')
@ApiTags('Order')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Roles(
    UserRole.PRO_USER,
    UserRole.SYSTEM_ADMINISTRATOR,
    UserRole.ADMINISTRATOR,
    UserRole.USER,
  )
  @UsePipes(new ValidateDtoPipe())
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @GetSessionUser() user: any,
  ) {
    createOrderDto.orderBy = new Types.ObjectId(user.sub);
    return this.orderService.create(createOrderDto);
  }

  @Post('payment-intent')
  @Roles(
    UserRole.PRO_USER,
    UserRole.SYSTEM_ADMINISTRATOR,
    UserRole.ADMINISTRATOR,
    UserRole.USER,
  )
  @UsePipes(new ValidateDtoPipe())
  async createPaymnetIntent(
    @Body() paymentIntent: PaymentIntentDto,
    @GetSessionUser() user: any,
  ) {
    return this.orderService.paymentIntent(paymentIntent , user?.sub);
  }

  // Get All Orders
  @Get()
  @Roles(UserRole.SYSTEM_ADMINISTRATOR, UserRole.ADMINISTRATOR)
  @DataSearchDecorator([
    { name: 'startDate', type: Date, required: false },
    { name: 'endDate', type: Date, required: false },
  ])
  async findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('order') order: string,
    @Query('sort') sort: SortBy,
    @Query('search') search: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
    @GetSessionUser() user: any,
  ) {
    return this.orderService.findAll({
      page,
      limit,
      order,
      sort,
      search,
      startDate,
      endDate,
      user,
    });
  }

  // Get All by restaurant
  @Roles(
    UserRole.PRO_USER,
    UserRole.SYSTEM_ADMINISTRATOR,
    UserRole.ADMINISTRATOR,
  )
  @Get('restaurant/:restaurantId')
  @DataSearchDecorator([
    { name: 'startDate', type: Date, required: false },
    { name: 'endDate', type: Date, required: false },
  ])
  async findAllByRestaurant(
    @Param('restaurantId') restaurant: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('order') order: string,
    @Query('sort') sort: SortBy,
    @Query('search') search: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return this.orderService.findAll({
      page,
      limit,
      order,
      sort,
      search,
      startDate,
      endDate,
      restaurant,
    });
  }

  @Get('mine')
  @Roles(
    UserRole.PRO_USER,
    UserRole.SYSTEM_ADMINISTRATOR,
    UserRole.ADMINISTRATOR,
    UserRole.USER,
  )
  @DataSearchDecorator([
    { name: 'startDate', type: Date, required: false },
    { name: 'endDate', type: Date, required: false },
  ])
  async findAllOrderByMe(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('order') order: string,
    @Query('sort') sort: SortBy,
    @Query('search') search: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
    @GetSessionUser() user: any,
  ) {
    return this.orderService.findAll({
      page,
      limit,
      order,
      sort,
      search,
      startDate,
      endDate,
      user,
    });
  }

  @Get(':id')
  @UsePipes(new ValidateDtoPipe())
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  @Roles(
    UserRole.PRO_USER,
    UserRole.SYSTEM_ADMINISTRATOR,
    UserRole.ADMINISTRATOR,
  )
  @UsePipes(new ValidateDtoPipe())
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(id, updateOrderDto);
  }

  @Patch(':id/status')
  @Roles(
    UserRole.PRO_USER,
    UserRole.SYSTEM_ADMINISTRATOR,
    UserRole.ADMINISTRATOR,
    UserRole.USER,
  )
  @UsePipes(new ValidateDtoPipe())
  updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @GetSessionUser() user: any,
  ) {
    const userId = user.sub;
    return this.orderService.updateStatus(id, updateOrderStatusDto, userId);
  }

  @Post(':id/review')
  @Roles(
    UserRole.PRO_USER,
    UserRole.SYSTEM_ADMINISTRATOR,
    UserRole.ADMINISTRATOR,
    UserRole.USER,
  )
  @UsePipes(new ValidateDtoPipe())
  addReview(
    @Param('id') id: string,
    @Body() createReviewDto: CreateReviewDto,
    @GetSessionUser() user: any,
  ) {
    createReviewDto.reviewBy = new Types.ObjectId(user.sub);
    return this.orderService.createReview(id, createReviewDto);
  }

  @Get(':id/review')
  @Roles(
    UserRole.PRO_USER,
    UserRole.SYSTEM_ADMINISTRATOR,
    UserRole.ADMINISTRATOR,
    UserRole.USER,
  )
  @UsePipes(new ValidateDtoPipe())
  getReviewByOrder(@Param('id') id: string, @GetSessionUser() user: any) {
    return this.orderService.getReviewByOrder(id, user);
  }

  @Delete(':id')
  @Roles(
    UserRole.PRO_USER,
    UserRole.SYSTEM_ADMINISTRATOR,
    UserRole.ADMINISTRATOR,
  )
  @UsePipes(new ValidateDtoPipe())
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }

  // @Post('order-status-history/:id')
  // @Roles(
  //   UserRole.PRO_USER,
  //   UserRole.SYSTEM_ADMINISTRATOR,
  //   UserRole.ADMINISTRATOR,
  // )
  // addOrderHistory(
  //   @Param('id') id: string,
  //   @Body() addOrderDeleveredHistoryDto: AddOrderStatusHistoryDto,
  // ) {
  //   return this.orderService.addOrderHistory(id, addOrderDeleveredHistoryDto);
  // }

  // @Patch('order-status-history/:id')
  // @Roles(
  //   UserRole.PRO_USER,
  //   UserRole.SYSTEM_ADMINISTRATOR,
  //   UserRole.ADMINISTRATOR,
  // )
  // updateOrderHistory(
  //   @Param('id') id: string,
  //   @Body() updateOrderDeleveredHistoryDto: UpdateOrderStatusHistoryDto,
  // ) {
  //   return this.orderService.updateOrderHistory(
  //     id,
  //     updateOrderDeleveredHistoryDto,
  //   );
  // }
  // @Delete('order-status-history/:id')
  // @Roles(
  //   UserRole.PRO_USER,
  //   UserRole.SYSTEM_ADMINISTRATOR,
  //   UserRole.ADMINISTRATOR,
  // )
  // removeOrderHistory(
  //   @Param('id') id: string,
  //   @Body() removeOrderStatusHistoryDto: RemoveOrderStatusHistoryDto,
  // ) {
  //   return this.orderService.removeOrderHistory(
  //     id,
  //     removeOrderStatusHistoryDto,
  //   );
  // }

  // @Post('order-delevered-status-history/:id')
  // @Roles(
  //   UserRole.PRO_USER,
  //   UserRole.SYSTEM_ADMINISTRATOR,
  //   UserRole.ADMINISTRATOR,
  //   UserRole.USER,
  // )
  // addOrderDeleveredHistory(@Param('id') id: string) {
  //   return this.orderService.addOrderDeleveredHistory(id);
  // }
}
