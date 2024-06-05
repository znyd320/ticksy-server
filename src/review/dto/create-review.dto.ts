import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsPositive, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { Ratting } from '../../common/enum';
import { Transform } from 'class-transformer';

export class CreateReviewDto {
  @ApiProperty({
    type: String,
    description: 'Details or content of the review',
    example: 'Great service and quality!',
  })
  @IsString()
  readonly details: string;

  @ApiProperty({
    type: Number,
    description: 'Rating given in the review',
    enum: Ratting,
    example: 5,
  })
  @IsNotEmpty()
  @IsPositive()
  readonly rating: number;

  reviewBy: Types.ObjectId;
  orderId: Types.ObjectId;
  bucketId: Types.ObjectId;
  restaurantId: Types.ObjectId;
}
