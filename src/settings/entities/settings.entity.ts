import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class Settings extends Document {
  @Prop({ type: String })
  webLogo: string;

  @Prop({ type: String })
  favIcon: string;

  @Prop({ type: String })
  appLogo: string;

  @Prop({ type: String })
  webTitle: string;

  @Prop({ type: String })
  appName: string;

  @Prop({ type: String })
  googleClientId: string;

  @Prop({ type: String })
  googleClientSecret: string;

  @Prop({ type: String })
  googleAuthRedirect: string;

  @Prop({ type: String })
  facebookAppId: string;

  @Prop({ type: String })
  facebookAppSecret: string;

  @Prop({ type: String })
  facebookAuthRedirect: string;

  @Prop({ type: String })
  appleClientId: string;

  @Prop({ type: String })
  appleTeamId: string;

  @Prop({ type: String })
  appleKeyId: string;

  @Prop({ type: String })
  applePrivateKey: string;

  @Prop({ type: String })
  appleAuthRedirect: string;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
