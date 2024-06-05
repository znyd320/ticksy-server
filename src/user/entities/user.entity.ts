import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserSigninBy } from '../../common/enum/enum-signin-by-social-id';
import { UserRole } from '../../common/enum/enum-user-role';
import { SentUserMailInterface } from '../../common/interface/sent-user-mail.interface';

@Schema({ timestamps: true, versionKey: false })
export class User extends Document {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop()
  mobileNumber: string;

  @Prop()
  address: string;

  @Prop()
  status: boolean;

  @Prop({ type: Boolean })
  termsAndCondition: boolean;

  @Prop({ type: [String], enum: UserRole, required: true })
  roles: string[];

  @Prop({ type: Array, enum: UserSigninBy })
  signinBy: UserSigninBy[];

  @Prop({ type: String })
  country: string;

  @Prop({ type: String })
  profileImage: string;

  @Prop({ type: Object })
  sentMail: SentUserMailInterface;

  @Prop({ type: String })
  token: string;

  @Prop({ type: String })
  deviceToken: string;

  @Prop({ type: Number, default: 0 })
  reserveFund: number;

  @Prop({ type: Boolean, default: true })
  allowPushNotification: boolean;

  @Prop({ type: Boolean, default: true })
  allowEmailNotification: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
