import { Types } from 'mongoose';
import { RoleEnum } from '../enums';

export interface IUser {
  fullName: string;
  userName: string;
  email: string;
  password: string;
  roleId: Types.ObjectId;
  isActive: boolean;
  changeCredentialTime?: Date;
  role?: RoleEnum;
}
