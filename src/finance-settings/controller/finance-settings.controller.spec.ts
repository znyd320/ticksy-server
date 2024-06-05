import { Test, TestingModule } from '@nestjs/testing';
import { FinanceSettingsService } from '../service/finance-settings.service';
import { FinanceSettingsController } from './finance-settings.controller';

describe('FinanceSettingsController', () => {
  let controller: FinanceSettingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FinanceSettingsController],
      providers: [FinanceSettingsService],
    }).compile();

    controller = module.get<FinanceSettingsController>(
      FinanceSettingsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
