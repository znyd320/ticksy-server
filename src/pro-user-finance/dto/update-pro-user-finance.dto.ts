import { PartialType } from '@nestjs/swagger';
import { CreateProUserFinanceDto } from './create-pro-user-finance.dto';

export class UpdateProUserFinanceDto extends PartialType(
  CreateProUserFinanceDto,
) {}
