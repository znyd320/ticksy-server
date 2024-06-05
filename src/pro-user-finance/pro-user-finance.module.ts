import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';
import { ProUserFinanceController } from './controller/pro-user-finance.controller';
import { ProUserFinanceSchema } from './entities/pro-user-finance.entity';
import { ProUserFinanceService } from './service/pro-user-finance.service';
import { SurprisedBucktModule } from 'src/surprised-bucket/surprised-bucket.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'ProUserFinance', schema: ProUserFinanceSchema },
    ]),
    UserModule,
    SurprisedBucktModule,
  ],
  controllers: [ProUserFinanceController],
  providers: [ProUserFinanceService],
  exports: [ProUserFinanceService],
})
export class ProUserFinanceModule {}
