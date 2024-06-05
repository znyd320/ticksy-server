import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { BucketCategory } from '../entities/bucket-category.entity';
import { BucketCategoryService } from '../service/bucket-category.service';
import { BucketCategoryController } from './bucket-category.controller';

describe('BucketCategoryController', () => {
  let controller: BucketCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BucketCategoryController],
      providers: [
        BucketCategoryService,
        {
          provide: getModelToken(BucketCategory.name),
          useValue: Model,
        },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<BucketCategoryController>(BucketCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
