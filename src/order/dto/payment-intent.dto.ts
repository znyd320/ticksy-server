import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsNotEmpty, IsPositive } from 'class-validator';
import { PaymentAccountType } from 'src/common/enum';

export class PaymentIntentDto {

  @ApiProperty({
    type: String,
    description: 'Type of payment account',
    enum: PaymentAccountType,
    example: PaymentAccountType.STRIPE,
  })
  @IsNotEmpty()
  @IsEnum(PaymentAccountType)
  readonly paymentAccountType: string;

  @ApiProperty({
    type: String,
    description: 'ID of the surprised bucket in the order',
    example: '60c6e2349a0cdc40f8b5f4d3',
    required: true,
  })
  @IsNotEmpty()
  @IsMongoId()
  readonly bucketId: string;

  @ApiProperty({
    type: String,
    description: 'ID of the restaurant for the order',
    example: '60c6e2349a0cdc40f8b5f4d4',
    required: true,
  })
  @IsNotEmpty()
  @IsMongoId()
  readonly restaurantId: string;

  @ApiProperty({
    type: Number,
    description: 'Quantity of items in the order',
    example: 2,
    required: true,
  })
  @IsNotEmpty()
  @IsPositive()
  readonly qty: number;
}
