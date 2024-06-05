import { ApiProperty } from '@nestjs/swagger';
import { UserSigninBy } from '../../common/enum/enum-signin-by-social-id';
import { UserRole } from '../../common/enum/enum-user-role';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  fullName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address of the user',
  })
  email: string;

  @ApiProperty({ example: 'password123', description: 'Password for the user' })
  password: string;

  @ApiProperty({
    example: '1234567890',
    description: 'Mobile number of the user',
  })
  mobileNumber: string;

  @ApiProperty({
    example: '123 Main St, City',
    description: 'Address of the user',
  })
  address: string;

  @ApiProperty({ example: true, description: 'Status of the user' })
  status: boolean;

  @ApiProperty({
    example: true,
    description: 'Acceptance of terms and conditions',
  })
  termsAndCondition: boolean;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      enum: Object.values(UserRole),
      example: UserRole.USER,
    },
    description: 'Roles assigned to the user',
  })
  roles: string[];

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      enum: Object.values(UserSigninBy),
      example: UserSigninBy.DEFAULT_CONNECTION,
    },
    description: 'Methods used for user sign-in',
  })
  signinBy: string[];

  @ApiProperty({ example: 'US', description: 'Country of the user' })
  country: string;

  @ApiProperty({
    type: String,
    format: 'binary',
    required: false,
    description: "URL of the user's profile image",
  })
  profileImage: string;

  @ApiProperty({
    example: { verificationCode: 8794, expiryTime: 360 },
    description: 'Object containing verification code and expiry time',
    type: Object,
  })
  sentMail: boolean;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    description: 'JWT token for authentication',
  })
  token: string;

  @ApiProperty({
    example: 'example push notification token',
    description: 'Device token for push notifications',
  })
  deviceToken: string;
  @ApiProperty({
    type: Boolean,
    example: true,
    description: 'SHould it allow push notification',
  })
  allowPushNotification: boolean;

  @ApiProperty({
    type: Boolean,
    example: true,
    description: 'SHould it allow push notification',
  })
  allowEmailNotification: boolean;

  reserveFund : number
}
