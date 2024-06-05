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

import { AuthGuard, RolesGuard } from '../../common/guard';

import { DataSearchDecorator } from '../../common/decorators/data-search.decorator';
import { SortBy } from '../../common/enum/enum-sort-by';

import { CreateRefundOrderDto } from '../dto/create-refund-order.dto';
import { UpdateRefundOrderDto } from '../dto/update-refund-order.dto';

import { Roles } from '../../common/decorators';
import { UserRole } from '../../common/enum';
import { RefundOrderService } from '../service/refund-order.service';
import { ValidateDtoPipe } from '../../common/pipe/validate-dto.pipe';

@Controller('refund-order')
@ApiTags('Refund Order')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class RefundOrderController {
  constructor(private readonly refundOrderService: RefundOrderService) {}

  @Post()
  @UsePipes(new ValidateDtoPipe())
  create(@Body() createRefundOrderDto: CreateRefundOrderDto) {
    return this.refundOrderService.create(createRefundOrderDto);
  }

  @Get()
  @Roles(
    UserRole.PRO_USER,
    UserRole.SYSTEM_ADMINISTRATOR,
    UserRole.ADMINISTRATOR,
    UserRole.USER,
  )
  @DataSearchDecorator([
    { name: 'startDate', type: Date, required: false, example: '2022-01-01' },
    { name: 'endDate', type: Date, required: false, example: '2022-02-01' },
  ])
  findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('order') order: string,
    @Query('sort') sort: SortBy,
    @Query('search') search: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return this.refundOrderService.findAll(
      page,
      limit,
      order,
      sort,
      search,
      startDate,
      endDate,
    );
  }

  @Get(':id')
  @Roles(
    UserRole.PRO_USER,
    UserRole.SYSTEM_ADMINISTRATOR,
    UserRole.ADMINISTRATOR,
  )
  @UsePipes(new ValidateDtoPipe())
  findOne(@Param('id') id: string) {
    return this.refundOrderService.findOne(id);
  }

  @Patch(':id')
  @Roles(
    UserRole.PRO_USER,
    UserRole.SYSTEM_ADMINISTRATOR,
    UserRole.ADMINISTRATOR,
    UserRole.USER,
  )
  @UsePipes(new ValidateDtoPipe())
  update(
    @Param('id') id: string,
    @Body() updateRefundOrderDto: UpdateRefundOrderDto,
  ) {
    return this.refundOrderService.update(id, updateRefundOrderDto);
  }

  @Delete(':id')
  @Roles(
    UserRole.PRO_USER,
    UserRole.SYSTEM_ADMINISTRATOR,
    UserRole.ADMINISTRATOR,
    UserRole.USER,
  )
  @UsePipes(new ValidateDtoPipe())
  remove(@Param('id') id: string) {
    return this.refundOrderService.remove(id);
  }
}
