import { Test, TestingModule } from '@nestjs/testing';
import { ProUserFinanceService } from '../service/pro-user-finance.service';
import { ProUserFinanceController } from './pro-user-finance.controller';

describe('ProUserFinanceController', () => {
  let controller: ProUserFinanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProUserFinanceController],
      providers: [ProUserFinanceService],
    }).compile();

    controller = module.get<ProUserFinanceController>(ProUserFinanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
