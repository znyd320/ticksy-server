import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators';
import { UserRole } from '../../common/enum';
import { AuthGuard, RolesGuard } from '../../common/guard';
import { DashboardService } from '../service/dashboard.service';

@Controller('dashboard')
@ApiTags('Dashboard')
// @ApiBearerAuth()
// @UseGuards(AuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('counts')
  @Roles(UserRole.SYSTEM_ADMINISTRATOR, UserRole.ADMINISTRATOR)
  async getDashboardCounts() {
    return this.dashboardService.getDashboardCounts();
  }

  @Get('yearly-order-report')
  @Roles(UserRole.SYSTEM_ADMINISTRATOR, UserRole.ADMINISTRATOR)
  async getMonthlyOrderReport(
    @Query('year') year: number = new Date().getFullYear(),
  ) {
    return this.dashboardService.getYearlyOrderReport(year);
  }
}
