import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsNumber } from 'class-validator';
import { PaymentAccountType } from '../../common/enum/enum-payment-account-type';
import { DateTimeRangeInterface } from '../../common/interface/date-time-range.interface';

export class CreateFinanceSettingDto {
  @ApiProperty({
    type: String,
    description: 'Name of the payment cycle',
    example: 'Monthly',
    required: true,
  })
  @IsNotEmpty()
  readonly paymentCycleName: string;

  @ApiProperty({
    type: Object,
    description: 'Date range for the finance setting',
    example: { startDate: '2022-01-01', endDate: '2022-12-31' },
  })
  @IsNotEmpty()
  readonly dateRange: DateTimeRangeInterface;

  @ApiProperty({
    type: Number,
    description: 'Minimum withdrawal amount',
    example: 100,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  readonly minimumWithdrawAmount: number;

  @ApiProperty({
    type: String,
    enum: PaymentAccountType,
    description: 'Type of payment account',
    example: PaymentAccountType.STRIPE,
  })
  @IsNotEmpty()
  readonly paymentAccountType: string;

  createdBy: string;
}
