import { PartialType } from '@nestjs/swagger';
import { CreateBucketPriceSettingDto } from './create-bucket-price-setting.dto';

export class UpdateBucketPriceSettingDto extends PartialType(
  CreateBucketPriceSettingDto,
) {}
