import { Body, Controller, Get, Post, Req, UsePipes } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ValidateDtoPipe } from 'src/common/pipe/validate-dto.pipe';
import { GoogleLoginDto } from '../dto/login.dto';
import { GoogleAuthService } from '../service/googleAuth.service';

@Controller('auth/google')
@ApiTags('Google Auth')
export class GoogleAuthController {
  constructor(private readonly googleAuthService: GoogleAuthService) {}

  @Post('login')
  @UsePipes(new ValidateDtoPipe())
  async handleGoogleAuth(@Body() googleLoginDto: GoogleLoginDto) {
    return this.googleAuthService.verifyGoogleToken(
      googleLoginDto.token,
      googleLoginDto.deviceToken,
    );
  }

  @Get('redirect')
  async googleAuthRedirect(@Req() req) {
    return req.user;
  }
}
