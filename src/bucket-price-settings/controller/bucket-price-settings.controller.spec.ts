import { Test, TestingModule } from '@nestjs/testing';
import { BucketPriceSettingsController } from './bucket-price-settings.controller';
import { BucketPriceSettingsService } from '../service/bucket-price-settings.service';

describe('BucketPriceSettingsController', () => {
  let controller: BucketPriceSettingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BucketPriceSettingsController],
      providers: [BucketPriceSettingsService],
    }).compile();

    controller = module.get<BucketPriceSettingsController>(
      BucketPriceSettingsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
