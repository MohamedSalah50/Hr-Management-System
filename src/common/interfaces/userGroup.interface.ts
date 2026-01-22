import { Types } from 'mongoose';
import { IPermission } from './permission.interface';
import { IUser } from './user.interface';

export interface IUserGroup {
  name: string;
  description?: string;
  permissions: IPermission[] | Types.ObjectId[];
  userIds: IUser[] | Types.ObjectId[];
}
