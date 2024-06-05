import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationModule } from 'src/notification/notification.module';
import { UserProfileImageUploadModule } from '../common/module';
import { ResourceDeleteModule } from '../common/module/resource-delete/resource-delete.module';
import { UserController } from './controller/user.controller';
import { UserSchema } from './entities/user.entity';
import { UserService } from './service/user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    UserProfileImageUploadModule,
    ResourceDeleteModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
