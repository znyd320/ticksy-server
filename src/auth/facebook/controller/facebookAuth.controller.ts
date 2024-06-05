import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { FacebookLoginDto } from '../dto/facebook-login.dto';
import { FacebookAuthService } from '../service/facebookAuth.service';

@Controller('auth/facebook')
@ApiTags('Facebook Auth')
export class FacebookAuthController {
  constructor(private readonly facebookAuthService: FacebookAuthService) {}
  @Post('login')
  async facebookLogin(@Body() facebookLoginDto: FacebookLoginDto) {
    return this.facebookAuthService.verifyFacebookToken(
      facebookLoginDto.token,
      facebookLoginDto.deviceToken,
    );
  }

  // api/auth/facebook/redirect
  @Get('redirect')
  @UseGuards(AuthGuard('facebook'))
  facebookLoginRedirect(@Req() req) {
    return {
      msg: 'Redirected',
      userInfo: req.user,
    };
  }
}
