import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from '../mail-connection/auth.module';
import { GoogleAuthController } from './controller/googleAuth.controller';
import { GoogleAuthService } from './service/googleAuth.service';

@Module({
  imports: [
    AuthModule,
    AuthModule,
    UserModule,
    JwtModule.register({
      secret: process.env.JWT_SECRECT_KEY,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [GoogleAuthController],
  providers: [GoogleAuthService],
})
export class GoogleAuthModule {}
