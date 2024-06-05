import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators';
import { DataSearchDecorator } from '../../common/decorators/data-search.decorator';
import { UserRole } from '../../common/enum';
import { SortBy } from '../../common/enum/enum-sort-by';
import { AuthGuard, RolesGuard } from '../../common/guard';
import { ValidateDtoPipe } from '../../common/pipe/validate-dto.pipe';
import { CreateBucketCategoryDto } from '../dto/create-bucket-category.dto';
import { UpdateBucketCategoryDto } from '../dto/update-bucket-category.dto';
import { BucketCategoryService } from '../service/bucket-category.service';
import { ImageCompressionInterceptor } from '../../common/module/file-upload/interceptor/image-compress-interceptor';
import { GetSessionUser } from '../../common/decorators/session-user.decorator';

@Controller('bucket-category')
@ApiTags('Bucket Category')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class BucketCategoryController {
  constructor(private readonly bucketCategoryService: BucketCategoryService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('bucketCategoryImage'),
    new ImageCompressionInterceptor(),
  )
  @Roles(
    UserRole.PRO_USER,
    UserRole.SYSTEM_ADMINISTRATOR,
    UserRole.ADMINISTRATOR,
  )
  @UsePipes(new ValidateDtoPipe())
  async create(
    @GetSessionUser() user: any,
    @Body() createBucketCategoryDto: CreateBucketCategoryDto,
    @UploadedFile() bucketCategoryImage: Express.Multer.File,
  ): Promise<any> {
    createBucketCategoryDto.createdBy = user.sub;
    return this.bucketCategoryService.create(
      createBucketCategoryDto,
      bucketCategoryImage,
    );
  }

  @Get()
  @Roles(
    UserRole.PRO_USER,
    UserRole.SYSTEM_ADMINISTRATOR,
    UserRole.ADMINISTRATOR,
  )
  @UsePipes(new ValidateDtoPipe())
  async dropdown() {
    return this.bucketCategoryService.dropdown();
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
    return this.bucketCategoryService.findAll(
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
  @UsePipes(new ValidateDtoPipe())
  async findOne(@Param('id') id: string) {
    return this.bucketCategoryService.findOne(id);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('bucketCategoryImage'),
    new ImageCompressionInterceptor(),
  )
  @UsePipes(new ValidateDtoPipe())
  async update(
    @Param('id') id: string,
    @Body() updateBucketCategoryDto: UpdateBucketCategoryDto,
    @UploadedFile() bucketCategoryImage: Express.Multer.File,
  ): Promise<any> {
    return this.bucketCategoryService.update(
      id,
      updateBucketCategoryDto,
      bucketCategoryImage,
    );
  }

  @Delete(':id')
  @UsePipes(new ValidateDtoPipe())
  async remove(@Param('id') id: string) {
    return this.bucketCategoryService.remove(id);
  }
}
