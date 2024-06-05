import { Test, TestingModule } from '@nestjs/testing';
import { RefundOrderService } from '../service/refund-order.service';
import { RefundOrderController } from './refund-order.controller';

describe('RefundOrderController', () => {
  let controller: RefundOrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RefundOrderController],
      providers: [RefundOrderService],
    }).compile();

    controller = module.get<RefundOrderController>(RefundOrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
