import { Test, TestingModule } from '@nestjs/testing';
import { ProUserFinanceService } from './pro-user-finance.service';

describe('ProUserFinanceService', () => {
  let service: ProUserFinanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProUserFinanceService],
    }).compile();

    service = module.get<ProUserFinanceService>(ProUserFinanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
