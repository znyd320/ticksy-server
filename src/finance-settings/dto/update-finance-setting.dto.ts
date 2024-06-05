import { PartialType } from '@nestjs/swagger';
import { CreateFinanceSettingDto } from './create-finance-setting.dto';

export class UpdateFinanceSettingDto extends PartialType(
  CreateFinanceSettingDto,
) {}
