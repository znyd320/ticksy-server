import { Module } from '@nestjs/common';
import { GetUploadFilesController } from './get-upload-files.controller';

@Module({
  controllers: [GetUploadFilesController],
})
export class GetUploadFilesModule {}
