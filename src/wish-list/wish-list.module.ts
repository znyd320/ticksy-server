import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WishListController } from './controller/wish-list.controller';
import { WishListSchema } from './entities/wish-list.entity';
import { WishListService } from './service/wish-list.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'WishList', schema: WishListSchema }]),
  ],
  controllers: [WishListController],
  providers: [WishListService],
})
export class WishListModule {}
