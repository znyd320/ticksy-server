import { Test, TestingModule } from '@nestjs/testing';
import { SurprisedBucktService } from './surprised-buckt.service';
import { SurprisedBucktController } from '../controller/surprised-buckt.controller';

describe('SurprisedBucktService', () => {
  let service: SurprisedBucktService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SurprisedBucktController],
      providers: [SurprisedBucktService],
    }).compile();

    service = module.get<SurprisedBucktService>(SurprisedBucktService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
