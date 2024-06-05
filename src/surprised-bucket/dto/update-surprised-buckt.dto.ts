import { PartialType } from '@nestjs/swagger';
import { CreateSurprisedBucktDto } from './create-surprised-buckt.dto';
import { IsOptional } from 'class-validator';
import { WeekDaysWithTime } from '../interfaces/week-days.interface';
import { Types } from 'mongoose';
import { Transform } from 'class-transformer';

export class UpdateSurprisedBucktDto extends PartialType(
  CreateSurprisedBucktDto,
) {
  @IsOptional()
  @Transform(({ value }) => (value !== '' ? value : undefined))
  readonly bucketName: string;
  @IsOptional()
  @Transform(({ value }) => (value !== '' ? value : undefined))
  readonly description: string;
  @IsOptional()
  @Transform(({ value }) =>
    value !== '' ? new Types.ObjectId(value) : undefined,
  )
  readonly proUserDetails: Types.ObjectId;
  @IsOptional()
  @Transform(({ value }) => (value !== '' ? value : undefined))
  readonly originalPrice: number;
  @IsOptional()
  @Transform(({ value }) => (value !== '' ? value : undefined))
  readonly discountedPrice: number;
  @IsOptional()
  @Transform(({ value }) => (value !== '' ? value : undefined))
  readonly category: string[];
  @IsOptional()
  @Transform(({ value }) => (value !== '' ? value : undefined))
  readonly numberOfBags: number;
  @IsOptional()
  @Transform(({ value }) => (value !== '' ? value : undefined))
  readonly weekDays: WeekDaysWithTime[];
  @IsOptional()
  @Transform(({ value }) => (value !== '' ? value : undefined))
  readonly subjectToVat: string;
  @IsOptional()
  @Transform(({ value }) => (value !== '' ? value : undefined))
  readonly officialLegalCompanyName: string;
  @IsOptional()
  @Transform(({ value }) => (value !== '' ? value : undefined))
  readonly vatNumber: string;
  @IsOptional()
  @Transform(({ value }) => (value !== '' ? value : undefined))
  readonly bucketImage: string;
  @IsOptional()
  @Transform(({ value }) =>
    value !== '' ? new Types.ObjectId(value) : undefined,
  )
  readonly createdBy: Types.ObjectId;
  @IsOptional()
  @Transform(({ value }) => (value !== '' ? value : undefined))
  readonly status: boolean;
}
