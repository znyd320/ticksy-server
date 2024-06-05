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
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { ReviewService } from '../service/review.service';
import { ValidateDtoPipe } from '../../common/pipe/validate-dto.pipe';
import { GetSessionUser } from '../../common/decorators/session-user.decorator';

@Controller('review')
@ApiTags('Review')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // @Get()
  // @DataSearchDecorator([
  //   { name: 'startDate', type: Date, required: false, example: '2022-01-01' },
  //   { name: 'endDate', type: Date, required: false, example: '2022-02-01' },
  // ])
  // findAll(
  //   @Query('page') page: number,
  //   @Query('limit') limit: number,
  //   @Query('order') order: string,
  //   @Query('sort') sort: SortBy,
  //   @Query('search') search: string,
  //   @Query('startDate') startDate: Date,
  //   @Query('endDate') endDate: Date,
  // ) {
  //   return this.reviewService.findAll(
  //     page,
  //     limit,
  //     order,
  //     sort,
  //     search,
  //     startDate,
  //     endDate,
  //   );
  // }

  // @Get("bucket/:bucketId")
  // @DataSearchDecorator([
  //   { name: 'startDate', type: Date, required: false, example: '2022-01-01' },
  //   { name: 'endDate', type: Date, required: false, example: '2022-02-01' },
  // ])
  // findAllByBucketId(
  //   @Param('bucketId') bucketId: string,
  //   @Query('page') page: number,
  //   @Query('limit') limit: number,
  //   @Query('order') order: string,
  //   @Query('sort') sort: SortBy,
  //   @Query('search') search: string,
  //   @Query('startDate') startDate: Date,
  //   @Query('endDate') endDate: Date,
  // ) {
  //   return this.reviewService.findAllReviewsOfSurprisedBuckt(
  //     {
  //       page,
  //       limit,
  //       order,
  //       sort,
  //       search,
  //       startDate,
  //       endDate,
  //       bucketId
  //     }
  //   );
  // }

  @Get(':id')
  @UsePipes(new ValidateDtoPipe())
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.USER)
  @UsePipes(new ValidateDtoPipe())
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewService.update(id, updateReviewDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMINISTRATOR, UserRole.SYSTEM_ADMINISTRATOR)
  @UsePipes(new ValidateDtoPipe())
  remove(@Param('id') id: string) {
    return this.reviewService.remove(id);
  }
}
