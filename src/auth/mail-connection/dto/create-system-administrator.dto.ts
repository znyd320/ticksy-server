import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { UserRole } from '../../../common/enum/enum-user-role';

export class CreateSystemAdministratorDto {
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'excel.azmin@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: '1234567890' })
  mobileNumber: string;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      enum: Object.values(UserRole),
      example: UserRole.SYSTEM_ADMINISTRATOR,
    },
    description: 'Roles assigned to the user',
  })
  @IsNotEmpty()
  roles: UserRole[];
}
