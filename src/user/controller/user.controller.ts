import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { GetSessionUser } from 'src/common/decorators/session-user.decorator';
import { Roles } from '../../common/decorators';
import { DataSearchDecorator } from '../../common/decorators/data-search.decorator';
import { UserRole } from '../../common/enum';
import { SortBy } from '../../common/enum/enum-sort-by';
import { RolesGuard } from '../../common/guard';
import { AuthGuard } from '../../common/guard/auth.guard';
import { ImageCompressionInterceptor } from '../../common/module/file-upload/interceptor/image-compress-interceptor';
import { ValidateDtoPipe } from '../../common/pipe/validate-dto.pipe';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserService } from '../service/user.service';

@Controller('user')
@ApiTags('User')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Post()
  // @UsePipes(new ValidateDtoPipe())
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.userService.create(createUserDto);
  // }

  @Get()
  @Roles(UserRole.USER, UserRole.PRO_USER, UserRole.SYSTEM_ADMINISTRATOR)
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
    @Query('fields') fields: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return this.userService.findAll(
      page,
      limit,
      order,
      sort,
      search,
      fields,
      startDate,
      endDate,
    );
  }

  @Get('me')
  @UsePipes(new ValidateDtoPipe())
  findMe(@GetSessionUser() user: any) {
    return this.userService.findOne(user?.sub);
  }

  @Get(':id')
  @UsePipes(new ValidateDtoPipe())
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch('me')
  @UsePipes(new ValidateDtoPipe())
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('profileImage'),
    new ImageCompressionInterceptor(),
  )
  updateMe(
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() profileImage: Express.Multer.File,
    @GetSessionUser() user: any,
  ) {
    return this.userService.update(user?.sub, updateUserDto, profileImage);
  }

  @Patch(':id')
  @UsePipes(new ValidateDtoPipe())
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('profileImage'))
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() profileImage: Express.Multer.File,
  ) {
    return this.userService.update(id, updateUserDto, profileImage);
  }

  @Delete(':id')
  @UsePipes(new ValidateDtoPipe())
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
