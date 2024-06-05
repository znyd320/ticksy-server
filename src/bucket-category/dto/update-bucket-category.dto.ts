import { PartialType } from '@nestjs/swagger';
import { CreateBucketCategoryDto } from './create-bucket-category.dto';

export class UpdateBucketCategoryDto extends PartialType(
  CreateBucketCategoryDto,
) {}
