import { Test, TestingModule } from '@nestjs/testing';
import { WishListService } from '../service/wish-list.service';
import { WishListController } from './wish-list.controller';

describe('WishListController', () => {
  let controller: WishListController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WishListController],
      providers: [WishListService],
    }).compile();

    controller = module.get<WishListController>(WishListController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
