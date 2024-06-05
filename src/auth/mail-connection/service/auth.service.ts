import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  CoreConfigService,
  JWT_SECRECT_KEY,
  MAIL_VERIFICATION_HOST,
} from '../../../common/config/core/core.service';
import { createApiResponse } from '../../../common/constants/create-api.response';
import {
  AN_ERROR_OCCURED_WHILE_SAVING_DATA,
  FAIELD_TO_SEND_VERIFICATION_MAIL,
  INVALID_PASSWORD,
  SUCCESS_RESPONSE,
  USER_ALREADY_EXIST,
  USER_CREATED_SUCCESSFULLY,
  USER_LOGIN_SUCCESSFUL,
  USER_MAIL_NOT_EXIST,
  USER_NOT_EXIST,
  USER_PASSWORD_UPDATE_SUCCESS,
  VERIFICATION_MAIL_SENT_FAILED,
  VERIFICATION_MAIL_SENT_SUCCESSFULLY,
  VERIFICATION_MISMATCHED,
  VERIFICATION_TIME_EXPIRED,
} from '../../../common/constants/message.response';
import { CreateUserDto } from '../../../user/dto/create-user.dto';
import { UserService } from '../../../user/service/user.service';
import { CreateSystemAdministratorDto } from '../dto/create-system-administrator.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { UserLoginDto } from '../dto/user-login.dto';
import { userVerificationDto } from '../dto/user-verification.dto';

import * as bcrypt from 'bcrypt';

import { InjectConnection } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { NotificationService } from '../../../notification/service/notification.service';
import { ValidateAndUpdatePasswordDto } from '../dto/validate-and-update-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailerService,
    private readonly notificationService: NotificationService,
    private readonly config: CoreConfigService,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  // This method verifies the registration code provided by the user
  // If the code matches, it creates a new user by calling the userService.createUser method
  // If the code doesn't match, it returns an expectation failed response

  async login(userLoginDto: UserLoginDto) {
    const userInfo = await this.userService.getUserByEmailWithPassword(
      userLoginDto.email,
    );

    if (!userInfo.length)
      throw new HttpException(USER_MAIL_NOT_EXIST, HttpStatus.NOT_FOUND);
    const matchPassword = await this.compareHashPassword(
      userLoginDto.password,
      userInfo[0].password,
    );
    if (!matchPassword)
      throw new HttpException(INVALID_PASSWORD, HttpStatus.UNAUTHORIZED);

    // Update User Device Token
    if (
      userLoginDto.deviceToken &&
      userLoginDto.deviceToken !== userInfo[0].deviceToken &&
      userLoginDto.deviceToken !== ''
    ) {
      await this.userService.update(userInfo[0]._id, {
        deviceToken: userLoginDto.deviceToken,
      });
    }

    const { access_token, data } = await this.getAccessToken(userInfo[0]);
    return createApiResponse(
      HttpStatus.OK,
      SUCCESS_RESPONSE,
      USER_LOGIN_SUCCESSFUL,
      { access_token, data },
    );
  }

  // This method creates a new user by first checking if the user already exists
  // If the user doesn't exist, it sends a registration verification code to the user's email
  // If the user already exists, it returns a conflict response
  async registerUser(createUserData: CreateUserDto) {
    const userExist = await this.userService.checkUserByEmail(
      createUserData.email,
    );

    if (userExist.length !== 0)
      throw new HttpException(USER_ALREADY_EXIST, HttpStatus.CONFLICT);

    const response_payload =
      await this.sendUserRegistrationVerificationCodeMail(createUserData);

    return createApiResponse(
      HttpStatus.ACCEPTED,
      SUCCESS_RESPONSE,
      VERIFICATION_MAIL_SENT_SUCCESSFULLY,
      response_payload,
    );
  }

  // This method verifies the registration code provided by the user
  // If the code matches, it creates a new user by calling the userService.createUser method
  // If the code doesn't match, it returns an expectation failed response
  async verifyRegCode(sessionUser: userVerificationDto, code: number) {
    const { verificationCode, ...userData } = sessionUser;

    if (+verificationCode !== +code)
      throw new HttpException(
        VERIFICATION_MISMATCHED,
        HttpStatus.EXPECTATION_FAILED,
      );

    const response = await this.userService.createUser(userData as any);

    if (!response)
      throw new HttpException(
        AN_ERROR_OCCURED_WHILE_SAVING_DATA,
        HttpStatus.EXPECTATION_FAILED,
      );

    const { data, access_token } = await this.getAccessToken(response);

    return createApiResponse(
      HttpStatus.CREATED,
      SUCCESS_RESPONSE,
      USER_CREATED_SUCCESSFULLY,
      { data, access_token },
    );
  }

  // This method creates a new system administrator by first checking if the user already exists
  // If the user doesn't exist, it sends a verification email to the user's email
  // If the user already exists, it returns a conflict response
  async registerSystemAdministrator(
    createSystemAdministrator: CreateSystemAdministratorDto,
  ) {
    const userExist = await this.userService.checkSystemAdministratorUser(
      createSystemAdministrator,
    );

    if (userExist.length)
      throw new HttpException(USER_ALREADY_EXIST, HttpStatus.CONFLICT);

    const payload = await this.sendSystemAdministratorVerificationMail(
      createSystemAdministrator,
    );
    return createApiResponse(
      HttpStatus.ACCEPTED,
      SUCCESS_RESPONSE,
      VERIFICATION_MAIL_SENT_SUCCESSFULLY,
      payload,
    );
  }

  // This method verifies the token provided for system administrator registration
  // If the token is valid, it creates a new system administrator by calling the userService.createSystemAdministrator method
  // If the token is invalid or expired, it returns an expectation failed response
  async verifyToken(token: string) {
    try {
      const verifyResponse = await this.tokenVerification(token);
      if (!verifyResponse)
        throw new HttpException(
          VERIFICATION_MAIL_SENT_FAILED,
          HttpStatus.EXPECTATION_FAILED,
        );

      const response =
        await this.userService.createSystemAdministrator(verifyResponse);

      if (!response) throw new Error(AN_ERROR_OCCURED_WHILE_SAVING_DATA);

      const { data, access_token } = await this.getAccessToken(response);

      return createApiResponse(
        HttpStatus.CREATED,
        SUCCESS_RESPONSE,
        USER_CREATED_SUCCESSFULLY,
        { data, access_token },
      );
    } catch (error) {
      throw new HttpException(
        error.response.message || error.message || VERIFICATION_TIME_EXPIRED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // This method validates and updates the user's password
  // It first checks if the verification code matches the provided code
  // If the codes match, it checks if the user exists
  // If the user exists, it updates the user's password and returns a success response
  // If the codes don't match or the user doesn't exist, it returns an appropriate error response
  async validateAndUpdatePassword(
    tokenData: any,
    resetPasswordDto: ValidateAndUpdatePasswordDto,
  ) {
    try {
      const { verificationCode, email } = tokenData;
      if (+verificationCode !== +resetPasswordDto.verificationCode)
        throw new HttpException(
          VERIFICATION_MISMATCHED,
          HttpStatus.EXPECTATION_FAILED,
        );

      const userExist = await this.userService.checkUserByEmail(email);
      if (userExist.length === 0)
        throw new HttpException(USER_NOT_EXIST, HttpStatus.NOT_FOUND);

      const { password } = resetPasswordDto;
      const updatedUserData = await this.userService.update(userExist[0]._id, {
        password,
      });

      const userData = updatedUserData.toObject();
      return createApiResponse(
        HttpStatus.OK,
        SUCCESS_RESPONSE,
        USER_PASSWORD_UPDATE_SUCCESS,
        userData,
      );
    } catch (error) {
      throw new HttpException(
        error.message || VERIFICATION_TIME_EXPIRED,
        HttpStatus.EXPECTATION_FAILED,
      );
    }
  }

  // This method initiates the password reset process by sending a verification code to the user's email
  // It first checks if the user exists
  // If the user exists, it generates a verification code and sends it to the user's email
  // If the user doesn't exist, it returns a not found response
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const { email } = resetPasswordDto;
      const userExist = await this.userService.checkUserByEmail(email);
      if (userExist.length === 0)
        throw new HttpException(USER_NOT_EXIST, HttpStatus.NOT_FOUND);

      const verificationCode = Math.floor(
        1000 + Math.random() * 9000,
      ).toString();
      return await this.sendUserPasswordReseterVerificationCodeMail(
        email,
        verificationCode,
      );
    } catch (err) {
      throw new HttpException(
        err.message || AN_ERROR_OCCURED_WHILE_SAVING_DATA,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // This method sends a password reset verification code to the user's email
  // It generates a JWT token with the user's email and verification code
  // It sends an email with the verification code and returns a success response with the token
  async sendUserPasswordReseterVerificationCodeMail(
    email: string,
    verificationCode: string,
  ) {
    try {
      const mailRes: any = await this.notificationService.sendNotificationEmail(
        {
          to: email,
          subject: 'Password Reset',
          text: 'Password Reset mail',
          html: `
          <p>Hi there!</p>
          <p>Your password Reset verification code is :</p>
          <b>${verificationCode}</b>
        `,
        },
      );

      if (mailRes?.response !== 'Success') {
        return mailRes;
      }

      const access_token_payload = {
        email,
        verificationCode,
      };

      const access_token = await this.jwtService.sign(access_token_payload, {
        expiresIn: '300s',
      });

      const response_payload = {
        email,
        access_token,
      };

      return createApiResponse(
        HttpStatus.OK,
        SUCCESS_RESPONSE,
        VERIFICATION_MAIL_SENT_SUCCESSFULLY,
        response_payload,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // This method verifies the provided JWT token
  async tokenVerification(token: string) {
    return await this.jwtService.verifyAsync(token, {
      secret: this.config.get(JWT_SECRECT_KEY),
    });
  }

  // This method sends a registration verification code to the user's email
  // It generates a JWT token with the user's data and verification code
  // It sends an email with the verification code and returns a success response with the token
  async sendUserRegistrationVerificationCodeMail(
    createUserData: CreateUserDto,
  ) {
    try {
      const verificationCode = Math.floor(1000 + Math.random() * 9000);

      const payload = {
        ...createUserData,
      };

      await this.mailService.sendMail({
        to: createUserData.email,
        subject: 'Registration Verification',
        text: 'Registration Verification mail',
        html: `
          <p>Hi there!</p>
          <p>Please verify your registration using this code below:</p>
          <b>${verificationCode}</b>
        `,
      });

      const access_token_payload = { ...payload, verificationCode };
      const access_token = await this.jwtService.sign(access_token_payload, {
        expiresIn: '300s',
      });

      const response_payload = {
        ...payload,
        access_token,
      };

      return response_payload;
    } catch (err) {
      throw new HttpException(
        err.message || FAIELD_TO_SEND_VERIFICATION_MAIL,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // This method sends a verification email to the system administrator's email
  // It first checks if the user already exists
  // If the user doesn't exist, it generates a JWT token with the user's data
  // It sends an email with a verification link containing the token and returns a success response
  async sendSystemAdministratorVerificationMail(
    createSystemAdministrator: CreateSystemAdministratorDto,
  ) {
    try {
      const payload = {
        fullName: createSystemAdministrator.fullName,
        roles: createSystemAdministrator.roles,
        email: createSystemAdministrator.email,
        password: createSystemAdministrator.password,
      };

      const access_token = await this.jwtService.sign(payload, {
        expiresIn: '300s',
      });

      await this.mailService.sendMail({
        to: createSystemAdministrator.email,
        subject: 'Registration Verification',
        text: 'Registration Verification mail',
        html: `
          <p>Hi there!</p>
          <p>Please verify your registration by clicking the link below:</p>
          <a href="${this.config.get(
            MAIL_VERIFICATION_HOST,
          )}/auth-mail/verify?token=${access_token}">Verify Email</a>
        `,
      });

      return payload;
    } catch (error) {
      throw new HttpException(
        error.message || FAIELD_TO_SEND_VERIFICATION_MAIL,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // This method compares the provided password with the hashed user password

  async compareHashPassword(password, userPassword) {
    return await bcrypt.compare(password, userPassword);
  }

  async getAccessToken(response) {
    const payload = {
      sub: (await response)._id,
      fullName: (await response).fullName,
      email: (await response).email,
      roles: (await response).roles,
    };
    const access_token = await this.jwtService.signAsync(payload);
    return { data: payload, access_token };
  }
}
