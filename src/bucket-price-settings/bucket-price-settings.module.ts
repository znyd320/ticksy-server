import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BucketCategoryModule } from '../bucket-category/bucket-category.module';
import { BucketPriceSettingsController } from './controller/bucket-price-settings.controller';
import { BucketPriceSettingSchema } from './entities/bucket-price-setting.entity';
import { BucketPriceSettingsService } from './service/bucket-price-settings.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'BucketPriceSetting', schema: BucketPriceSettingSchema },
    ]),
    BucketCategoryModule,
  ],
  controllers: [BucketPriceSettingsController],
  providers: [BucketPriceSettingsService],
})
export class BucketPriceSettingsModule {}
