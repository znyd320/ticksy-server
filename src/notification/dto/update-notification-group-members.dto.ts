import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateNotificationGroupMembersDto {

    @ApiProperty({
        type: [Types.ObjectId],
        description: 'Array of user IDs to include in the group',
        example: ['6123456789abcdef01234567', '6123456789abcdef01234568'],
    })
    @IsArray()
    @IsNotEmpty()
    @MaxLength(500)
    @Transform(({ value }) => new Types.ObjectId(value))
    readonly userIds: Types.ObjectId[];
}
