// schemas/user-group.schema.ts

import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { IUserGroup } from 'src/common';

@Schema({ timestamps: true })
export class UserGroup implements IUserGroup {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Permission' }], default: [] })
  permissions: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  userIds: Types.ObjectId[];

  @Prop({ required: false, default: false })
  freezedAt: boolean;
}

export type UserGroupDocument = HydratedDocument<UserGroup>;

export const UserGroupSchema = SchemaFactory.createForClass(UserGroup);


export const UserGroupModel = MongooseModule.forFeature([
  {
    name: UserGroup.name,
    schema: UserGroupSchema,
  },
]);
