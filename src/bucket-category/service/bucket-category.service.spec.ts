import { Test, TestingModule } from '@nestjs/testing';
import { BucketCategoryService } from './bucket-category.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BucketCategory } from '../entities/bucket-category.entity';
import { SortBy } from 'src/common/enum/enum-sort-by';
import { CreateBucketCategoryDto } from '../dto/create-bucket-category.dto';

const mockBucketCategory = {
  id: 1,
  name: 'Test Category',
  description: 'Test Description',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockRepository = {
  find: jest.fn().mockResolvedValue([mockBucketCategory]),
  findOne: jest.fn().mockResolvedValue(mockBucketCategory),
  create: jest.fn().mockReturnValue(mockBucketCategory),
  save: jest.fn().mockResolvedValue(mockBucketCategory),
  update: jest.fn().mockResolvedValue(mockBucketCategory),
  delete: jest.fn().mockResolvedValue(undefined),
};

describe('BucketCategoryService', () => {
  let service: BucketCategoryService;
  let repository: Repository<BucketCategory>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BucketCategoryService,
        {
          provide: getRepositoryToken(BucketCategory),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BucketCategoryService>(BucketCategoryService);
    repository = module.get<Repository<BucketCategory>>(
      getRepositoryToken(BucketCategory),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of bucket categories', async () => {
      const result = await service.findAll(0, 10, '',SortBy.ASC,'', new Date() , new Date(new Date().getTime() + 50242200));
      expect(result).toEqual([mockBucketCategory]);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a bucket category', async () => {
      const result = await service.findOne('1');
      expect(result).toEqual(mockBucketCategory);
      expect(repository.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('create', () => {
    it('should create a new bucket category', async () => {
      const createDto: CreateBucketCategoryDto = {
        bucketCategoryName: 'New Category',
        description: 'New Description',
        bucketCategoryImage: null,
        createdBy: 'testUser',
      };
      const result = await service.create(createDto, null);
      expect(result).toEqual(mockBucketCategory);
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(mockBucketCategory);
    });
  });

  describe('update', () => {
    it('should update a bucket category', async () => {
      const updateDto = {
        name: 'Updated Category',
        description: 'Updated Description',
        bucketCategoryImage: null,
      };
      const result = await service.update('1', updateDto, null); // Add null for the missing argument
      expect(result).toEqual(mockBucketCategory);
      expect(repository.update).toHaveBeenCalledWith('1', updateDto, null); // Add null for the missing argument
    });
  });

  describe('remove', () => {
    it('should remove a bucket category', async () => {
      const result = await service.remove('1');
      expect(result).toBeUndefined();
      expect(repository.delete).toHaveBeenCalledWith('1');
    });
  });
});
