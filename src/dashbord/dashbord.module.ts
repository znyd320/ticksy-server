import { Module } from '@nestjs/common';
import { DashboardService } from './service/dashboard.service';
import { UserModule } from 'src/user/user.module';
import { ProUserFinanceModule } from 'src/pro-user-finance/pro-user-finance.module';
import { OrderModule } from 'src/order/order.module';
import { DashboardController } from './controller/dashboard.controller';

@Module({
  imports: [UserModule, ProUserFinanceModule, OrderModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashbordModule {}
