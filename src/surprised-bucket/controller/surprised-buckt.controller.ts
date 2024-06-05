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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { DataSearchDecorator } from '../../common/decorators/data-search.decorator';
import { GetSessionUser } from '../../common/decorators/session-user.decorator';
import { OptionalAuthGuard } from '../../common/guard/optional.auth.guard';
import { ImageCompressionInterceptor } from '../../common/module/file-upload/interceptor/image-compress-interceptor';
import { Roles } from '../../common/decorators';
import { UserRole } from '../../common/enum';
import { SortBy } from '../../common/enum/enum-sort-by';
import { AuthGuard, RolesGuard } from '../../common/guard';
import { ValidateDtoPipe } from '../../common/pipe/validate-dto.pipe';
import { CreateSurprisedBucktDto } from '../dto/create-surprised-buckt.dto';
import { DeleteSurprisedBucktImageDto } from '../dto/delete-surprised-buckt-image.dto';
import { UpdateSurprisedBucktDto } from '../dto/update-surprised-buckt.dto';
import { SurprisedBucktService } from '../service/surprised-buckt.service';

@Controller('surprised-bucket')
@ApiTags('Surprised Bucket')
export class SurprisedBucktController {
  constructor(private readonly surprisedBucktService: SurprisedBucktService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(
    UserRole.PRO_USER,
    UserRole.SYSTEM_ADMINISTRATOR,
    UserRole.ADMINISTRATOR,
  )
  @UsePipes(new ValidateDtoPipe())
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('bucketImage'),
    new ImageCompressionInterceptor(),
  )
  async create(
    @GetSessionUser() user: any,
    @Body() createSurprisedBucktDto: CreateSurprisedBucktDto,
    @UploadedFile() bucketImages: Express.Multer.File,
  ) {
    createSurprisedBucktDto.createdBy = user.sub;
    return this.surprisedBucktService.create(
      createSurprisedBucktDto,
      bucketImages,
    );
  }

  // Get Surprice buckets
  @Get()
  @ApiBearerAuth()
  @UseGuards(OptionalAuthGuard)
  @DataSearchDecorator([
    { name: 'startDate', type: Date, required: false, example: '2022-01-01' },
    { name: 'endDate', type: Date, required: false, example: '2022-02-01' },
    { name: 'categories', type: String, required: false, example: '' },
    { name: 'weekDay', type: String, required: false, example: 'tomorrow' },
    { name: 'restorant', type: String, required: false, example: '' },
  ])
  findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('order') order: string,
    @Query('sort') sort: SortBy,
    @Query('search') search: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
    @Query('weekDay') weekDay: string,
    @Query('categories') categories: string,
    @Query('restorant') restorant: string,
    @GetSessionUser() user: any,
  ) {
    return this.surprisedBucktService.findAll({
      page,
      limit,
      order,
      sort,
      search,
      startDate,
      endDate,
      weekDay,
      categories,
      restorant,
      user,
    });
  }

  // Get Surprice bucket's Reviews
  @Get(':bucketId/reviews')
  @ApiBearerAuth()
  @UseGuards(OptionalAuthGuard)
  @DataSearchDecorator([
    { name: 'startDate', type: Date, required: false, example: '2022-01-01' },
    { name: 'endDate', type: Date, required: false, example: '2022-02-01' },
  ])
  findAllReviewsOfSurprisedBuckt(
    @Param('bucketId') bucketId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('order') order: string,
    @Query('sort') sort: SortBy,
    @Query('search') search: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return this.surprisedBucktService.findAllReviewsOfSurprisedBuckt({
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

  @Get('restaurant/:restaurantId')
  @ApiBearerAuth()
  @UseGuards(OptionalAuthGuard)
  @DataSearchDecorator([
    { name: 'startDate', type: Date, required: false, example: '2022-01-01' },
    { name: 'endDate', type: Date, required: false, example: '2022-02-01' },
    { name: 'categories', type: String, required: false, example: '' },
    { name: 'weekDay', type: String, required: false, example: 'tomorrow' },
  ])
  findAllByRestorant(
    @Param('restaurantId') restorant: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('order') order: string,
    @Query('sort') sort: SortBy,
    @Query('search') search: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
    @Query('weekDay') weekDay: string,
    @Query('categories') categories: string,
    @GetSessionUser() user: any,
  ) {
    return this.surprisedBucktService.findAll({
      page,
      limit,
      order,
      sort,
      search,
      startDate,
      endDate,
      weekDay,
      categories,
      restorant,
      user,
    });
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(OptionalAuthGuard)
  @UsePipes(new ValidateDtoPipe())
  findOne(@Param('id') id: string, @GetSessionUser() user: any) {
    return this.surprisedBucktService.findOne(id, user);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(
    UserRole.ADMINISTRATOR,
    UserRole.SYSTEM_ADMINISTRATOR,
    UserRole.PRO_USER,
  )
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('bucketImage'),
    new ImageCompressionInterceptor(),
  )
  update(
    @Param('id') id: string,
    @Body() updateSurprisedBucktDto: UpdateSurprisedBucktDto,
    @UploadedFile() bucketImage: Express.Multer.File,
  ) {
    return this.surprisedBucktService.update(
      id,
      updateSurprisedBucktDto,
      bucketImage,
    );
  }

  @Post('remove-image/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(
    UserRole.ADMINISTRATOR,
    UserRole.SYSTEM_ADMINISTRATOR,
    UserRole.PRO_USER,
  )
  @ApiConsumes('multipart/form-data')
  removeImage(
    @Param('id') id: string,
    @Body() deleteSurprisedBucktImageDto: DeleteSurprisedBucktImageDto,
  ) {
    console.log(deleteSurprisedBucktImageDto);
    return this.surprisedBucktService.removeImage(
      id,
      deleteSurprisedBucktImageDto,
    );
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @UsePipes(new ValidateDtoPipe())
  @Roles(
    UserRole.PRO_USER,
    UserRole.ADMINISTRATOR,
    UserRole.SYSTEM_ADMINISTRATOR,
  )
  remove(@Param('id') id: string) {
    return this.surprisedBucktService.remove(id);
  }
}
