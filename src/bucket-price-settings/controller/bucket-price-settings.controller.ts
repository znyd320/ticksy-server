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
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators';
import { DataSearchDecorator } from '../../common/decorators/data-search.decorator';
import { GetSessionUser } from '../../common/decorators/session-user.decorator';
import { UserRole } from '../../common/enum';
import { SortBy } from '../../common/enum/enum-sort-by';
import { AuthGuard, RolesGuard } from '../../common/guard';
import { CreateBucketPriceSettingDto } from '../dto/create-bucket-price-setting.dto';
import { UpdateBucketPriceSettingDto } from '../dto/update-bucket-price-setting.dto';
import { BucketPriceSettingsService } from '../service/bucket-price-settings.service';

@Controller('bucket-price-settings')
@ApiTags('Bucket Price Settings')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class BucketPriceSettingsController {
  constructor(
    private readonly bucketPriceSettingsService: BucketPriceSettingsService,
  ) {}

  @Post()
  @Roles(UserRole.SYSTEM_ADMINISTRATOR, UserRole.ADMINISTRATOR)
  create(
    @Body() createBucketPriceSettingDto: CreateBucketPriceSettingDto,
    @GetSessionUser() user: any,
  ) {
    createBucketPriceSettingDto.createdBy = user.sub;
    return this.bucketPriceSettingsService.create(
      createBucketPriceSettingDto,
      user,
    );
  }

  @Get()
  @Roles(
    UserRole.SYSTEM_ADMINISTRATOR,
    UserRole.ADMINISTRATOR,
    UserRole.PRO_USER,
  )
  @DataSearchDecorator([
    { name: 'startDate', type: Date, required: false, example: '2022-01-01' },
    { name: 'endDate', type: Date, required: false, example: '2025-02-01' },
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
    return this.bucketPriceSettingsService.findAll(
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
    UserRole.SYSTEM_ADMINISTRATOR,
    UserRole.ADMINISTRATOR,
    UserRole.PRO_USER,
  )
  findOne(@Param('id') id: string) {
    return this.bucketPriceSettingsService.findOne(id);
  }

  @Get('category/:id')
  @Roles(
    UserRole.SYSTEM_ADMINISTRATOR,
    UserRole.ADMINISTRATOR,
    UserRole.PRO_USER,
  )
  findByCategory(@Param('id') id: string) {
    return this.bucketPriceSettingsService.findByCategory(id);
  }

  @Patch(':id')
  @Roles(UserRole.SYSTEM_ADMINISTRATOR, UserRole.ADMINISTRATOR)
  update(
    @Param('id') id: string,
    @Body() updateBucketPriceSettingDto: UpdateBucketPriceSettingDto,
  ) {
    return this.bucketPriceSettingsService.update(
      id,
      updateBucketPriceSettingDto,
    );
  }

  @Delete(':id')
  @Roles(UserRole.SYSTEM_ADMINISTRATOR, UserRole.ADMINISTRATOR)
  remove(@Param('id') id: string) {
    return this.bucketPriceSettingsService.remove(id);
  }
}
