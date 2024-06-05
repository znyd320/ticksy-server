// pro-user-finance.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators';
import { DataSearchDecorator } from '../../common/decorators/data-search.decorator';
import { UserRole } from '../../common/enum';
import { SortBy } from '../../common/enum/enum-sort-by';
import { ValidateDtoPipe } from '../../common/pipe/validate-dto.pipe';
import { CreateProUserFinanceDto } from '../dto/create-pro-user-finance.dto';
import { UpdateProUserFinanceDto } from '../dto/update-pro-user-finance.dto';
import { ProUserFinanceService } from '../service/pro-user-finance.service';

@Controller('pro-user-finance')
@ApiTags('Pro User Finance')
export class ProUserFinanceController {
  constructor(private readonly proUserFinanceService: ProUserFinanceService) {}

  @ApiBearerAuth()
  @Post()
  @Roles(
    UserRole.PRO_USER,
    UserRole.SYSTEM_ADMINISTRATOR,
    UserRole.ADMINISTRATOR,
  )
  @UsePipes(new ValidateDtoPipe())
  async create(@Body() createProUserFinanceDto: CreateProUserFinanceDto) {
    return this.proUserFinanceService.create(createProUserFinanceDto);
  }

  @Get()
  @DataSearchDecorator([
    { name: 'startDate', type: Date, required: false, example: '2022-01-01' },
    { name: 'endDate', type: Date, required: false, example: '2022-02-01' },
  ])
  async findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('order') order: string,
    @Query('sort') sort: SortBy,
    @Query('search') search: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return this.proUserFinanceService.findAll(
      page,
      limit,
      order,
      sort,
      search,
      startDate,
      endDate,
    );
  }

  @Get('/all')
  async findAllProUserFinances() {
    return this.proUserFinanceService.findAllWithoutPagination();
  }

  @Get('/geo-location')
  async findAllByGeoLocation(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('distance') distance: number,
  ) {
    return this.proUserFinanceService.findAllByGeoLocation(
      latitude,
      longitude,
      distance,
    );
  }

  @Get(':id')
  @UsePipes(new ValidateDtoPipe())
  async findOne(@Param('id') id: string) {
    return this.proUserFinanceService.findOne(id);
  }

  @Get('user/:id')
  @UsePipes(new ValidateDtoPipe())
  async findOneByUser(@Param('id') id: string) {
    return this.proUserFinanceService.findByUserId(id);
  }
  @Get('bucket/:id')
  @UsePipes(new ValidateDtoPipe())
  async findOneByBucket(@Param('id') id: string) {
    return this.proUserFinanceService.findByBucketId(id);
  }

  @Patch(':id')
  @UsePipes(new ValidateDtoPipe())
  async update(
    @Param('id') id: string,
    @Body() updateProUserFinanceDto: UpdateProUserFinanceDto,
  ) {
    console.log('updateProUserFinanceDto', updateProUserFinanceDto);
    console.log('id', id);
    return this.proUserFinanceService.update(id, updateProUserFinanceDto);
  }

  @Delete(':id')
  @UsePipes(new ValidateDtoPipe())
  async remove(@Param('id') id: string) {
    return this.proUserFinanceService.remove(id);
  }
}
