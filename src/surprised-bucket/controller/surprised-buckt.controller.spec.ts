import { Test, TestingModule } from '@nestjs/testing';
import { SurprisedBucktService } from '../service/surprised-buckt.service';
import { SurprisedBucktController } from './surprised-buckt.controller';

describe('SurprisedBucktController', () => {
  let controller: SurprisedBucktController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SurprisedBucktController],
      providers: [SurprisedBucktService],
    }).compile();

    controller = module.get<SurprisedBucktController>(SurprisedBucktController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
