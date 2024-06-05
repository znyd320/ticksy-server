import { Test, TestingModule } from '@nestjs/testing';
import { FinanceSettingsService } from './finance-settings.service';

describe('FinanceSettingsService', () => {
  let service: FinanceSettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FinanceSettingsService],
    }).compile();

    service = module.get<FinanceSettingsService>(FinanceSettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
