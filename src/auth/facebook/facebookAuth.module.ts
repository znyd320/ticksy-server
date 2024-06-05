import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { FacebookAuthController } from './controller/facebookAuth.controller';
import { FacebookAuthService } from './service/facebookAuth.service';

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      secret: process.env.JWT_SECRECT_KEY,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [FacebookAuthController],
  providers: [FacebookAuthService],
})
export class FacebookAuthModule {}
