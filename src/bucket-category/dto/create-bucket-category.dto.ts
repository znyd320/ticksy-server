import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateBucketCategoryDto {
  @ApiProperty({
    type: String,
    description: 'Name of the bucket category',
    example: 'Travel',
    required: true,
  })
  @IsNotEmpty()
  readonly bucketCategoryName: string;

  @ApiProperty({
    type: String,
    description: 'Description of the bucket category',
    example: 'Places to visit around the world',
  })
  readonly description: string;

  @ApiProperty({
    type: String,
    description: 'URL of the bucket category image',
    format: 'binary',
    required: false,
  })
  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: "URL of the user's profile image",
  })
  bucketCategoryImage: string;

  createdBy: string;
}
