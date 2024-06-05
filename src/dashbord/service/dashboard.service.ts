import { HttpStatus, Injectable } from '@nestjs/common';
import {
  FAIELD_RESPONSE,
  SUCCESS_RESPONSE,
  createApiResponse,
} from 'src/common/constants';
import { OrderService } from 'src/order/service/order.service';
import { ProUserFinanceService } from 'src/pro-user-finance/service/pro-user-finance.service';
import { UserService } from 'src/user/service/user.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly userService: UserService,
    private readonly proUserFinanceService: ProUserFinanceService,
    private readonly orderService: OrderService,
  ) {}

  async getDashboardCounts() {
    try {
      const proUserDashbordPromise =
        this.proUserFinanceService.dashbordCounting();
      const userDashbordPromise = this.userService.getDashbordCounting();
      const orderDashbordPromise = this.orderService.getDashbordCounting();

      const [proUserDashbord, userDashbord, orderDashbord] = await Promise.all([
        proUserDashbordPromise,
        userDashbordPromise,
        orderDashbordPromise,
      ]);
      const payload = {
        totalUsers: userDashbord,
        ...proUserDashbord,
        ...orderDashbord,
      };

      return createApiResponse(HttpStatus.OK, SUCCESS_RESPONSE,"", payload);
    } catch (error) {
      createApiResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        FAIELD_RESPONSE,
        error.message,
      );
    }
  }

  async getYearlyOrderReport(year: number) {
    try {
      const orderReport = await this.orderService.getYearlyOrderReport(year);
      return createApiResponse(HttpStatus.OK, SUCCESS_RESPONSE,"", orderReport);
    } catch (error) {
      createApiResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        FAIELD_RESPONSE,
        error.message,
      );
    }
  }
}
