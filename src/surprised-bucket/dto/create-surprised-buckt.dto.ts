import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { YesNo } from '../../common/enum';
import { WeekDaysWithTime } from '../interfaces/week-days.interface';
import { Transform } from 'class-transformer';

export class CreateSurprisedBucktDto {
  @ApiProperty({
    type: String,
    description: 'Name of the surprised bucket',
    example: 'Special Bucket',
    required: true,
  })
  @IsString()
  readonly bucketName: string;

  @ApiProperty({
    type: String,
    description: 'Description of the surprised bucket',
    example: 'A special collection of goodies',
  })
  @IsString()
  readonly description: string;

  @ApiProperty({
    type: String,
    description: 'ID of the pro user finance / Restorant',
    example: new Types.ObjectId(),
    required: true,
  })
  @IsOptional()
  @Transform(({ value }) => new Types.ObjectId(value))
  readonly proUserDetails: Types.ObjectId;

  @ApiProperty({
    type: Number,
    description: 'Original price of the surprised bucket',
    example: 50,
    required: true,
  })
  @IsOptional()
  readonly originalPrice: number;

  @ApiProperty({
    type: Number,
    description: 'Discounted price of the surprised bucket',
    example: 40,
    required: true,
  })
  @IsOptional()
  readonly discountedPrice: number;

  @ApiProperty({
    type: [String],
    description: 'Category of the surprised bucket',
    example: ['Gifts'],
    required: true,
  })
  @IsString()
  readonly category: string[];

  @ApiProperty({
    type: Number,
    description: 'Number of bags in the surprised bucket',
    example: 5,
    required: true,
  })
  @IsOptional()
  readonly numberOfBags: number;

  @ApiProperty({
    type: [Object],
    description: 'Days when the surprised bucket is available',
    example: [{ day: 'Mon', startTime: '10:00 AM', endTime: '5:00 PM' }],
    default: [],
  })
  @IsString()
  readonly weekDays: WeekDaysWithTime[];

  @ApiProperty({
    type: String,
    enum: YesNo,
    description: 'Whether the surprised bucket is subject to VAT',
    example: YesNo.NO,
    required: false,
  })
  @IsString()
  readonly subjectToVat: string;

  @ApiProperty({
    type: String,
    description: 'Official legal company name for VAT',
    example: 'ABC Company',
    required: false,
  })
  @IsString()
  readonly officialLegalCompanyName: string;

  @ApiProperty({
    type: String,
    description: 'VAT number for the surprised bucket',
    example: 'VAT123456',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly vatNumber: string;

  @ApiProperty({
    type: String,
    format: 'binary',
    description: 'URL of the surprised bucket image',
    required: false,
  })
  @IsOptional()
  readonly bucketImage: string;

  @ApiProperty({
    type: Boolean,
    description: 'Status of the surprised bucket',
    example: true,
    default: true,
  })
  @IsOptional()
  readonly status: boolean;

  createdBy: Types.ObjectId;
}
