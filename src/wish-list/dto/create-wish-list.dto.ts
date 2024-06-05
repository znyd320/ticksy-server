import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class CreateWishListDto {
  @ApiProperty({
    type: String,
    description: 'List of surprised bucket IDs in the wish list',
    example: '60c6e2349a0cdc40f8b5f4d3',
  })
  @IsNotEmpty()
  @Transform(({ value }) => new Types.ObjectId(value))
  readonly bucket: Types.ObjectId;
}
