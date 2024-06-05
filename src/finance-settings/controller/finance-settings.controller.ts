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
import { ValidateDtoPipe } from '../../common/pipe/validate-dto.pipe';
import { CreateFinanceSettingDto } from '../dto/create-finance-setting.dto';
import { UpdateFinanceSettingDto } from '../dto/update-finance-setting.dto';
import { FinanceSettingsService } from '../service/finance-settings.service';
import { GetSessionUser } from '../../common/decorators/session-user.decorator';

@Controller('finance-settings')
@ApiTags('Finance Settings')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class FinanceSettingsController {
  constructor(
    private readonly financeSettingsService: FinanceSettingsService,
  ) {}

  @Post()
  @Roles(
    UserRole.PRO_USER,
    UserRole.SYSTEM_ADMINISTRATOR,
    UserRole.ADMINISTRATOR,
  )
  @UsePipes(new ValidateDtoPipe())
  async create(
    @GetSessionUser() user: any,
    @Body() createFinanceSettingDto: CreateFinanceSettingDto,
  ): Promise<any> {
    createFinanceSettingDto.createdBy = user.sub;
    return this.financeSettingsService.create(createFinanceSettingDto);
  }

  @Get('dropdown')
  @Roles(
    UserRole.PRO_USER,
    UserRole.SYSTEM_ADMINISTRATOR,
    UserRole.ADMINISTRATOR,
  )
  @UsePipes(new ValidateDtoPipe())
  async dropdown() {
    return this.financeSettingsService.dropdown();
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
    return this.financeSettingsService.findAll(
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
    return this.financeSettingsService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidateDtoPipe())
  async update(
    @Param('id') id: string,
    @Body() updateFinanceSettingDto: UpdateFinanceSettingDto,
  ): Promise<any> {
    return this.financeSettingsService.update(id, updateFinanceSettingDto);
  }

  @Delete(':id')
  @UsePipes(new ValidateDtoPipe())
  async remove(@Param('id') id: string) {
    return this.financeSettingsService.remove(id);
  }
}
