import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import {
  SUCCESS_RESPONSE,
  USER_LOGIN_SUCCESSFUL,
  createApiResponse,
} from 'src/common/constants';
import { UserService } from 'src/user/service/user.service';
import { CoreConfigService } from '../../../common/config/core/core.service';

@Injectable()
export class GoogleAuthService {
  constructor(
    private readonly config: CoreConfigService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async verifyGoogleToken(token: string, deviceToken: string) {
    try {
      const CLIENT_ID = this.config.get('GOOGLE_CLIENT_ID');
      const client = new OAuth2Client(CLIENT_ID);

      // verify the token
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,
      });

      // get the token payload
      const payload = ticket.getPayload();

      console.log('payload', payload);

      // find user by email
      const user = await this.userService.findByEmail(payload.email);

      console.log('user', user);

      // if user exists, return token
      if (user) {
        // define payload
        const data = {
          sub: user?._id,
          fullName: user?.fullName,
          email: user?.email,
          roles: user?.roles,
        };

        // Save Device Token
        await this.userService.update(user?._id, { deviceToken });

        // create JWT token
        const jwtToken = await this.jwtService.signAsync(data);

        // send response
        return createApiResponse(
          HttpStatus.OK,
          SUCCESS_RESPONSE,
          USER_LOGIN_SUCCESSFUL,
          { access_token: jwtToken, data }, // Send user details in the payload
        );
      }

      // if user does not exist, return payload
      const newUser = await this.userService.createGoogleAuthUser({
        fullName: payload.name,
        email: payload.email,
        password: Math.random()?.toString(36)?.substring(7),
        profileImage: payload.picture,
      });

      // Save Device Token
      await this.userService.update(newUser._id, { deviceToken });

      // define payload
      const data = {
        sub: newUser?._id,
        fullName: newUser?.fullName,
        email: newUser?.email,
        roles: newUser?.roles,
      };

      // create JWT token
      const jwtToken = await this.jwtService.signAsync(data);

      // send response
      return createApiResponse(
        HttpStatus.OK,
        SUCCESS_RESPONSE,
        USER_LOGIN_SUCCESSFUL,
        { access_token: jwtToken, data }, // Send user details in the payload
      );
    } catch (error) {
      console.log('error', error);

      throw new BadRequestException('Invalid token');
    }
  }
}
