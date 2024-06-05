import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BucketCategoryImageUploadModule } from '../common/module';
import { BucketCategoryController } from './controller/bucket-category.controller';
import { BucketCategorySchema } from './entities/bucket-category.entity';
import { BucketCategoryService } from './service/bucket-category.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'BucketCategory', schema: BucketCategorySchema },
    ]),
    BucketCategoryImageUploadModule,
  ],
  controllers: [BucketCategoryController],
  providers: [BucketCategoryService],
  exports: [BucketCategoryService],
})
export class BucketCategoryModule {}
