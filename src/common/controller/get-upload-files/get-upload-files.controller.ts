import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@Controller('uploads')
@ApiTags('Get Upload Files')
export class GetUploadFilesController {
  @Get('user-profile-image/:filename')
  async getUserProfileImage(@Param('filename') filename, @Res() res: Response) {
    res.sendFile(filename, { root: './uploads/user-profile-image' });
  }

  @Get('bucket-category-image/:filename')
  async getBucketCategoryImage(
    @Param('filename') filename,
    @Res() res: Response,
  ) {
    res.sendFile(filename, { root: './uploads/bucket-category-image' });
  }

  @Get('surprise-bucket-image/:filename')
  async getSurprisedBucketImage(
    @Param('filename') filename,
    @Res() res: Response,
  ) {
    res.sendFile(filename, {
      root: './uploads/surprise-bucket-image',
    });
  }
}
