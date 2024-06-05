import { Global, Module } from '@nestjs/common';
import { ResourceDeleteService } from './resource-delete.service';

@Global()
@Module({
  providers: [ResourceDeleteService],
  exports: [ResourceDeleteService],
})
export class ResourceDeleteModule {}
