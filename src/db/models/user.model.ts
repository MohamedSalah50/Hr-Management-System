import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { IUser, RoleEnum } from 'src/common';
import {  generateHash } from 'src/utils';

export type UserDocument = HydratedDocument<User> & {
  actualMobileNumber?: string | null;
};
@Schema({
  timestamps: true,
  strict: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User implements IUser {
  @Prop({ required: true, minlength: 10, maxlength: 50 })
  fullName: string;

  @Prop({ required: true, unique: true, minlength: 7, maxlength: 20 })
  userName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: Types.ObjectId, ref: 'Role' })
  roleId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ enum: RoleEnum, default: RoleEnum.user })
  role: RoleEnum;

  @Prop({ type: Date })
  changeCredentialTime: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await generateHash(this.password);
  }
  next();
});


export const UserModel = MongooseModule.forFeature([
  {
    name: User.name,
    schema: UserSchema,
  },
]);
