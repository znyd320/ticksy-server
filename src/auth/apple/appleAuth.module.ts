import { Module } from '@nestjs/common';
import { AuthModule } from '../mail-connection/auth.module';
import { AppleAuthController } from './controller/appleAuth.controller';
import { AppleAuthService } from './service/appleAuth.service';

@Module({
  imports: [AuthModule],
  controllers: [AppleAuthController],
  providers: [AppleAuthService],
})
export class AppleAuthModule {}
