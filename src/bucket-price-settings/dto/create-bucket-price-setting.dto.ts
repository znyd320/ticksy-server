import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

class PriceList {
  actualPrice: number;
  sellPrice: number;
}

export class CreateBucketPriceSettingDto {
  @ApiProperty({
    type: String,
    description: 'Id of the bucket category',
    example: new Types.ObjectId(),
    required: true,
  })
  @IsNotEmpty()
  @Transform(({ value }) => new Types.ObjectId(value))
  readonly categoryId: Types.ObjectId;

  @ApiProperty({
    type: [PriceList],
    description: 'List of prices for different price ranges',
    example: [
      {
        actualPrice: 100,
        sellPrice: 80,
      },
    ],
    required: true,
  })
  @IsNotEmpty()
  readonly priceList: PriceList[];

  createdBy: Types.ObjectId;
}
