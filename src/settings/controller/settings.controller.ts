import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators';
import { UserRole } from '../../common/enum';
import { AuthGuard, RolesGuard } from '../../common/guard';
import { UpdateSettingsDto } from '../dto/update-settings.dto';
import { SettingsService } from '../service/settings.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('settings')
@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @Roles(UserRole.SYSTEM_ADMINISTRATOR, UserRole.ADMINISTRATOR)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'webLogo', maxCount: 1 },
      { name: 'favIcon', maxCount: 1 },
      { name: 'appLogo', maxCount: 1 },
    ]),
  )
  update(
    @Body() updateSettingsDto: UpdateSettingsDto,
    @UploadedFiles()
    files: {
      webLogo?: Express.Multer.File[];
      favIcon?: Express.Multer.File[];
      appLogo?: Express.Multer.File[];
    },
  ) {
    const webLogo = files.webLogo ? files.webLogo[0] : null;
    const favIcon = files.favIcon ? files.favIcon[0] : null;
    const appLogo = files.appLogo ? files.appLogo[0] : null;
    return this.settingsService.update(updateSettingsDto, webLogo, favIcon, appLogo);
  }

  @Get()
  getSettings() {
    return this.settingsService.getSettings();
  }
}
