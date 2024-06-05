import { Test, TestingModule } from '@nestjs/testing';
import { BucketPriceSettingsService } from './bucket-price-settings.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BucketPriceSetting } from '../entities/bucket-price-setting.entity';
import { BucketCategoryService } from '../../bucket-category/service/bucket-category.service';
import { SortBy } from '../../common/enum/enum-sort-by';
import { CreateBucketPriceSettingDto } from '../dto/create-bucket-price-setting.dto';
import { UpdateBucketPriceSettingDto } from '../dto/update-bucket-price-setting.dto';
import { Types } from 'mongoose';

const mockBucketPriceSetting = {
  _id: new Types.ObjectId(),
  categoryId: new Types.ObjectId(),
  priceList: [
    {
      actualPrice: 100,
      sellPrice: 80,
    },
  ],
  createdBy: new Types.ObjectId(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockModel = {
  new: jest.fn().mockResolvedValue(mockBucketPriceSetting),
  constructor: jest.fn().mockResolvedValue(mockBucketPriceSetting),
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  save: jest.fn(),
  aggregate: jest.fn(),
  exec: jest.fn(),
};

const mockBucketCategoryService = {
  isExist: jest.fn(),
};

describe('BucketPriceSettingsService', () => {
  let service: BucketPriceSettingsService;
  let model: Model<BucketPriceSetting>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BucketPriceSettingsService,
        {
          provide: getModelToken(BucketPriceSetting.name),
          useValue: mockModel,
        },
        {
          provide: BucketCategoryService,
          useValue: mockBucketCategoryService,
        },
      ],
    }).compile();

    service = module.get<BucketPriceSettingsService>(BucketPriceSettingsService);
    model = module.get<Model<BucketPriceSetting>>(getModelToken(BucketPriceSetting.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new bucket price setting', async () => {
      const user = { sub: new Types.ObjectId() };
      const createDto: CreateBucketPriceSettingDto = {
        categoryId: new Types.ObjectId(),
        priceList: [
          {
            actualPrice: 100,
            sellPrice: 80,
          },
        ],
        createdBy: user.sub,
      };
      mockBucketCategoryService.isExist.mockResolvedValue(true);

      const result = await service.create(createDto, user);
      expect(result).toBeDefined();
      expect(mockBucketCategoryService.isExist).toHaveBeenCalledWith(
        createDto.categoryId,
      );
      expect(mockModel.new).toHaveBeenCalledWith(
        expect.objectContaining(createDto),
      );
      expect(mockModel.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of bucket price settings', async () => {
      const page = 1;
      const limit = 10;
      const order = 'createdAt';
      const sort = SortBy.DESC;
      const search = '';
      const startDate = new Date();
      const endDate = new Date(new Date().getTime() + 50242200);

      const result = await service.findAll(page, limit, order, sort, search, startDate, endDate);
      expect(result).toBeDefined();
      expect(mockModel.aggregate).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a bucket price setting', async () => {
      const id = new Types.ObjectId();
      mockModel.findById.mockResolvedValue(mockBucketPriceSetting);

      const result = await service.findOne(id);
      expect(result).toBeDefined();
      expect(mockModel.findById).toHaveBeenCalledWith(id);
    });
  });

  describe('findByCategory', () => {
    it('should return bucket price settings by category', async () => {
      const categoryId = new Types.ObjectId();
      mockModel.find.mockResolvedValue([mockBucketPriceSetting]);

      const result = await service.findByCategory(categoryId);
      expect(result).toBeDefined();
      expect(mockModel.find).toHaveBeenCalledWith({ categoryId });
    });
  });

  describe('update', () => {
    it('should update a bucket price setting', async () => {
      const id = new Types.ObjectId();
      const updateDto: UpdateBucketPriceSettingDto = {
        priceList: [
          {
            actualPrice: 120,
            sellPrice: 100,
          },
        ],
      };
      mockModel.findByIdAndUpdate.mockResolvedValue(mockBucketPriceSetting);

      const result = await service.update(id, updateDto);
      expect(result).toBeDefined();
      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(id, updateDto, { new: true });
    });
  });

  describe('remove', () => {
    it('should remove a bucket price setting', async () => {
      const id = new Types.ObjectId();
      mockModel.findByIdAndDelete.mockResolvedValue(mockBucketPriceSetting);

      const result = await service.remove(id);
      expect(result).toBeDefined();
      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith(id);
    });
  });
});
