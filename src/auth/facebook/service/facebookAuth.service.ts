import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios, { AxiosResponse } from 'axios';
import { Profile } from 'passport';
import {
  SUCCESS_RESPONSE,
  USER_LOGIN_SUCCESSFUL,
  createApiResponse,
} from 'src/common/constants';
import { UserService } from 'src/user/service/user.service';

export interface FacebookResponse {
  name: string;
  picture: Picture;
  id: string;
}

export interface Picture {
  data: Data;
}

export interface Data {
  height: number;
  is_silhouette: boolean;
  url: string;
  width: number;
}

@Injectable()
export class FacebookAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async verifyFacebookToken(token: string, deviceToken: string) {
    try {
      const response: AxiosResponse<FacebookResponse, any> = await axios.get(
        `https://graph.facebook.com/v13.0/me?fields=email,name,picture&access_token=${token}`,
      );
      const data = response.data;

      // check user by email
      const user = await this.userService.findByEmail(`${data?.id}@gmail.com`);

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
        await this.userService.update(user._id, { deviceToken });
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
        fullName: data.name,
        email: `${data.id}@gmail.com`,
        profileImage: data.picture.data.url,
        password: Math.random()?.toString(36)?.substring(7),
      });

      // Save Device Token
      await this.userService.update(newUser._id, { deviceToken });
      // define payload
      const payload = {
        sub: newUser?._id,
        fullName: newUser?.fullName,
        email: newUser?.email,
        roles: newUser?.roles,
      };

      // create JWT token
      const jwtToken = await this.jwtService.signAsync(payload);

      // send response
      return createApiResponse(
        HttpStatus.OK,
        SUCCESS_RESPONSE,
        USER_LOGIN_SUCCESSFUL,
        { access_token: jwtToken, payload }, // Send user details in the payload
      );
    } catch (error) {
      console.error('Error verifying Facebook token:', error);
      throw error;
    }
  }
  // Facebook token verification logic goes here

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    // User validation and data processing logic goes here
    return {
      id: profile.id,
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
    };
  }
}
