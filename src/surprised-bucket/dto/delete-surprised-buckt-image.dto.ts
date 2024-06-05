import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class DeleteSurprisedBucktImageDto {
  @ApiProperty({
    type: String,
    description: 'Name of the surprised bucket',
    example: 'Special Bucket',
  })
  // @IsString()
  @IsOptional()
  readonly imagePath: string;
}
