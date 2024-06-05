import { Test, TestingModule } from '@nestjs/testing';
import { RefundOrderService } from './refund-order.service';

describe('RefundOrderService', () => {
  let service: RefundOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RefundOrderService],
    }).compile();

    service = module.get<RefundOrderService>(RefundOrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
