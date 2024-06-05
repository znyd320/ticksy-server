import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingsController } from './controller/settings.controller';
import { SettingsSchema } from './entities/settings.entity';
import { SettingsService } from './service/settings.service';
import { SettingsImageUploadModule } from 'src/common/module/file-upload/settings-image-upload.module';
import { ResourceDeleteModule } from 'src/common/module/resource-delete/resource-delete.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Settings', schema: SettingsSchema }]),
    SettingsImageUploadModule,
  ],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
