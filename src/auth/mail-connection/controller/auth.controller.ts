import {
  Body,
  Controller,
  Param,
  Post,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CreateUserDto } from '../../../user/dto/create-user.dto';
import { AuthGuard } from '../../../common/guard/auth.guard';
import { ValidateDtoPipe } from '../../../common/pipe/validate-dto.pipe';
import { CreateSystemAdministratorDto } from '../dto/create-system-administrator.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { UserLoginDto } from '../dto/user-login.dto';
import { userVerificationDto } from '../dto/user-verification.dto';
import { ValidateAndUpdatePasswordDto } from '../dto/validate-and-update-password.dto';
import { AuthService } from '../service/auth.service';
import { GetSessionUser } from 'src/common/decorators/session-user.decorator';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/system-administrator')
  @UsePipes(new ValidateDtoPipe())
  async createSystemAdministrator(
    @Body() createSystemAdministrator: CreateSystemAdministratorDto,
  ) {
    return await this.authService.registerSystemAdministrator(
      createSystemAdministrator,
    );
  }

  @Post('/registration')
  @UsePipes(new ValidateDtoPipe())
  async registration(@Body() createUserData: CreateUserDto) {
    return await this.authService.registerUser(createUserData);
  }

  @Post('verify-registration-code')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @UsePipes(new ValidateDtoPipe())
  async verifyVerificationCode(
    @Body() verificationData: userVerificationDto,
    @GetSessionUser() sessionUser: any,
  ) {
    const verificationCode = verificationData.verificationCode;
    return await this.authService.verifyRegCode(sessionUser, verificationCode);
  }

  @Post('login')
  @UsePipes(new ValidateDtoPipe())
  login(@Body() userLoginDto: UserLoginDto) {
    return this.authService.login(userLoginDto);
  }

  @Post('forgot-password')
  @UsePipes(new ValidateDtoPipe())
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('reset-password')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @UsePipes(new ValidateDtoPipe())
  async verifyAndUpdatePassword(
    @Body() verificationData: ValidateAndUpdatePasswordDto,
    @Req() request: Request,
  ) {
    const velidationData = verificationData;
    const userData: any = request['user'];
    return await this.authService.validateAndUpdatePassword(
      userData,
      velidationData,
    );
  }

  @Post('mail-verify/:token')
  @UsePipes(new ValidateDtoPipe())
  async verifyToken(@Param('token') token: string) {
    return this.authService.verifyToken(token);
  }
}
