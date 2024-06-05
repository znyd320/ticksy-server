import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

class GeoLocationInterface {
  type: string;
  coordinates: [number, number]; // [longitude, latitude]
}

const GeoLocationExample = {
  type: 'Point',
  coordinates: [-122.084, 37.4275],
};

export class CreateProUserFinanceDto {
  @ApiProperty({
    type: String,
    description: 'ID of the pro user details',
    example: '60c6e2349a0cdc40f8b5f4d2',
    required: true,
  })
  @IsNotEmpty()
  @Transform(({ value }) => new Types.ObjectId(value))
  readonly proUserDetails: Types.ObjectId;

  @ApiProperty({
    type: String,
    description: 'Payment cycle for the pro user',
    example: 'Monthly',
    required: true,
  })
  @IsNotEmpty()
  readonly paymentCycle: string;

  @ApiProperty({
    type: Number,
    description: 'Minimum amount for pro user finance',
    example: 100,
    required: true,
  })
  @IsPositive()
  readonly minimumAmount: number;

  @ApiProperty({
    type: String,
    description: 'Type of payment account',
    example: 'Bank',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly paymentAccountType: string;

  @ApiProperty({
    type: String,
    description: 'About this restaurant',
    example: 'The Restaurant provides a good service',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly about: string;

  @ApiProperty({
    type: String,
    description: 'Payment account number',
    example: '1234567890',
  })
  @IsString()
  readonly paymentAccountNumber: string;

  @ApiProperty({
    type: String,
    description: 'Name of the restaurant associated with pro user finance',
    example: 'My Restaurant',
  })
  @IsString()
  readonly restaurantName: string;

  @ApiProperty({
    type: String,
    description: 'Address of the restaurant',
    example: '123 Main Street',
  })
  @IsString()
  readonly address: string;

  @ApiProperty({
    type: String,
    description: 'Postal code of the restaurant',
    example: '12345',
  })
  @IsString()
  readonly postalCode: string;

  @ApiProperty({
    type: String,
    description: 'City of the restaurant',
    example: 'Cityville',
  })
  @IsString()
  readonly city: string;

  @ApiProperty({
    type: String,
    description: 'Country of the restaurant',
    example: 'Countryland',
  })
  @IsString()
  readonly country: string;

  @ApiProperty({
    type: String,
    description: 'Billing email for pro user finance',
    example: 'billing@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  readonly billingEmail: string;

  @ApiProperty({
    type: String,
    description: 'Mobile number for pro user finance',
    example: '+1234567890',
  })
  @IsNotEmpty()
  readonly mobileNumber: string;

  @ApiProperty({
    type: Boolean,
    description: 'Status of pro user finance',
    example: true,
    default: true,
  })
  @IsBoolean()
  readonly status: boolean;

  @ApiProperty({
    type: Boolean,
    description: 'Agreement to terms and conditions',
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  readonly termsAndCondition: boolean;

  @ApiProperty({ type: Number, description: 'Longitude of the restaurant' })
  @IsNotEmpty()
  @IsLongitude()
  readonly longitude: number;

  @ApiProperty({ type: Number, description: 'Latitude of the restaurant' })
  @IsNotEmpty()
  @IsLatitude()
  readonly latitude: number;

  @ApiProperty({
    type: GeoLocationInterface,
    description: 'Geo Location of this restaurant',
    example: GeoLocationExample,
  })
  location: GeoLocationInterface;
}
