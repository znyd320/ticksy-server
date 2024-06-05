import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SurpriseBucketImageUploadModule } from '../common/module/file-upload/surprise-bucket-image-upload.module';
import { SurprisedBucktController } from './controller/surprised-buckt.controller';
import { SurprisedBucketSchema } from './entities/surprised-bucket.entity';
import { SurprisedBucktService } from './service/surprised-buckt.service';
import { ResourceDeleteModule } from '../common/module/resource-delete/resource-delete.module';
import { ProUserFinanceModule } from '../pro-user-finance/pro-user-finance.module';
import { ReviewModule } from 'src/review/review.module';

@Module({
  imports: [
    forwardRef(() => ProUserFinanceModule),
    MongooseModule.forFeature([
      { name: 'SurprisedBucket', schema: SurprisedBucketSchema },
    ]),
    SurpriseBucketImageUploadModule,
    ResourceDeleteModule,
    ReviewModule,
  ],
  controllers: [SurprisedBucktController],
  providers: [SurprisedBucktService],
  exports: [SurprisedBucktService],
})
export class SurprisedBucktModule {}
