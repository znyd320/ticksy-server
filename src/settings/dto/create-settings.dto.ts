import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSettingsDto {
  @ApiProperty({
    // type: String,
    format: 'binary',
    description: 'Web logo image',
    required : false
  })
  webLogo: string;
  
  @ApiProperty({
    // type: String,
    format: 'binary',
    description: 'Favicon image',
    required : false
  })
  favIcon: string;
  
  @ApiProperty({
    // type: String,
    format: 'binary',
    description: 'App logo image',
    required : false
  })
  appLogo: string;

  @ApiProperty({
    type: String,
    description: 'Web title',
    example: 'My Website',
  })
  @IsString()
  @IsNotEmpty()
  readonly webTitle: string;

  @ApiProperty({
    type: String,
    description: 'App name',
    example: 'My App',
  })
  @IsString()
  @IsNotEmpty()
  readonly appName: string;

  @ApiProperty({
    type: String,
    description: 'Google client ID',
    example: 'your-google-client-id',
  })
  @IsString()
  @IsNotEmpty()
  readonly googleClientId: string;

  @ApiProperty({
    type: String,
    description: 'Google client secret',
    example: 'your-google-client-secret',
  })
  @IsString()
  @IsNotEmpty()
  readonly googleClientSecret: string;

  @ApiProperty({
    type: String,
    description: 'Google auth redirect URL',
    example: 'https://example.com/auth/google/redirect',
  })
  @IsString()
  @IsNotEmpty()
  readonly googleAuthRedirect: string;

  @ApiProperty({
    type: String,
    description: 'Facebook app ID',
    example: 'your-facebook-app-id',
  })
  @IsString()
  @IsNotEmpty()
  readonly facebookAppId: string;

  @ApiProperty({
    type: String,
    description: 'Facebook app secret',
    example: 'your-facebook-app-secret',
  })
  @IsString()
  @IsNotEmpty()
  readonly facebookAppSecret: string;

  @ApiProperty({
    type: String,
    description: 'Facebook auth redirect URL',
    example: 'https://example.com/auth/facebook/redirect',
  })
  @IsString()
  @IsNotEmpty()
  readonly facebookAuthRedirect: string;

  @ApiProperty({
    type: String,
    description: 'Apple client ID',
    example: 'your-apple-client-id',
  })
  @IsString()
  @IsNotEmpty()
  readonly appleClientId: string;

  @ApiProperty({
    type: String,
    description: 'Apple team ID',
    example: 'your-apple-team-id',
  })
  @IsString()
  @IsNotEmpty()
  readonly appleTeamId: string;

  @ApiProperty({
    type: String,
    description: 'Apple key ID',
    example: 'your-apple-key-id',
  })
  @IsString()
  @IsNotEmpty()
  readonly appleKeyId: string;

  @ApiProperty({
    type: String,
    description: 'Apple private key',
    example: 'your-apple-private-key',
  })
  @IsString()
  @IsNotEmpty()
  readonly applePrivateKey: string;

  @ApiProperty({
    type: String,
    description: 'Apple auth redirect URL',
    example: 'https://example.com/auth/apple/redirect',
  })
  @IsString()
  @IsNotEmpty()
  readonly appleAuthRedirect: string;
}
