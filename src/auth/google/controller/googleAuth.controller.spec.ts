import { Test, TestingModule } from '@nestjs/testing';
import { GoogleAuthService } from '../service/googleAuth.service';
import { GoogleAuthController } from './googleAuth.controller';

describe('GoogleAuthController', () => {
  let controller: GoogleAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoogleAuthController],
      providers: [GoogleAuthService],
    }).compile();

    controller = module.get<GoogleAuthController>(GoogleAuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
