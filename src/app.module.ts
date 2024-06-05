import { MailerModule } from '@nestjs-modules/mailer';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { TerminusModule } from '@nestjs/terminus';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppleAuthModule } from './auth/apple/appleAuth.module';
import { FacebookAuthModule } from './auth/facebook/facebookAuth.module';
import { GoogleAuthModule } from './auth/google/googleAuth.module';
import { AuthModule } from './auth/mail-connection/auth.module';
import { CoreConfigModule } from './common/config/core/core.module';
import { getDefaultMailConnectionConfig } from './common/constants/mail.connection';
import { getDefaultDbConnectionString } from './common/constants/mongoose.connection';
import { getThroTTLconfig } from './common/constants/throttle.config';
import { GetUploadFilesModule } from './common/controller/get-upload-files/get-upload-files.module';
import { httpConfig } from './common/module/http/http-config';
import { NotificationModule } from './notification/notification.module';
import { SettingsModule } from './settings/settings.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    TerminusModule,
    HttpModule.register(httpConfig),
    MongooseModule.forRoot(getDefaultDbConnectionString()),
    MailerModule.forRoot(getDefaultMailConnectionConfig()),
    ThrottlerModule.forRoot(getThroTTLconfig()),
    CoreConfigModule,
    AuthModule,
    GoogleAuthModule,
    FacebookAuthModule,
    AppleAuthModule,
    UserModule,
    JwtModule,
    // BucketCategoryModule,
    // SurprisedBucktModule,
    // ProUserFinanceModule,
    // FinanceSettingsModule,
    // OrderModule,
    // RefundOrderModule,
    // ReviewModule,
    // WishListModule,
    // MessagesModule,
    NotificationModule,
    GetUploadFilesModule,
    // BucketPriceSettingsModule,
    // DashbordModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
