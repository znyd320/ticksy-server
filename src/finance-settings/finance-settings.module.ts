import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FinanceSettingsController } from './controller/finance-settings.controller';
import { FinanceSettingsSchema } from './entities/finance-setting.entity';
import { FinanceSettingsService } from './service/finance-settings.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'FinanceSettings', schema: FinanceSettingsSchema },
    ]),
  ],
  controllers: [FinanceSettingsController],
  providers: [FinanceSettingsService],
})
export class FinanceSettingsModule {}
