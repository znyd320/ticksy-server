import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ValidateDtoPipe } from '../../common/pipe/validate-dto.pipe';
import { Roles } from '../../common/decorators';
import { UserRole } from '../../common/enum';
import { AuthGuard, RolesGuard } from '../../common/guard';
import { CreateWishListDto } from '../dto/create-wish-list.dto';
import { WishListService } from '../service/wish-list.service';
import { Request } from 'express';
import { DataSearchDecorator } from '../../common/decorators/data-search.decorator';
import { SortBy } from '../../common/enum/enum-sort-by';

@Controller('wish-list')
@ApiTags('Wish List')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class WishListController {
  constructor(private readonly wishListService: WishListService) {}

  @Post()
  @Roles(UserRole.USER, UserRole.PRO_USER, UserRole.SYSTEM_ADMINISTRATOR, UserRole.ADMINISTRATOR)  
  @UsePipes(new ValidateDtoPipe())
  create(@Body() createWishListDto: CreateWishListDto, @Req() req: Request) {
    const userInfo: any = req.user;
    return this.wishListService.create(createWishListDto, userInfo);
  }
  
  @Get()
  @Roles(UserRole.USER, UserRole.PRO_USER, UserRole.SYSTEM_ADMINISTRATOR, UserRole.ADMINISTRATOR)  
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
    @Req() req: Request,
  ) {
    const userInfo: any = req.user;
    return this.wishListService.findAll(
      userInfo.sub,
      page,
      limit,
      order,
      sort,
      search,
      startDate,
      endDate,
    );
  }
  
  @Delete(':id')
  @Roles(UserRole.USER, UserRole.PRO_USER, UserRole.SYSTEM_ADMINISTRATOR, UserRole.ADMINISTRATOR)  
  @UsePipes(new ValidateDtoPipe())
  remove(@Param('id') id: string, @Req() req: Request) {
    const userInfo: any = req.user;
    return this.wishListService.remove(id, userInfo);
  }
}
