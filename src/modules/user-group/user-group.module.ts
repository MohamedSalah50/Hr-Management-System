import { Module } from '@nestjs/common';
import { UserGroupsController } from './user-group.controller';
import { UserGroupsService } from './user-group.service';
import {
  PermissionModel,
  PermissionRepository,
  UserGroupModel,
  UserGroupRepository,
  UserModel,
  UserRepository,
} from 'src/db';

@Module({
  imports: [UserModel, UserGroupModel, PermissionModel],
  controllers: [UserGroupsController],
  providers: [
    UserGroupsService,
    UserGroupRepository,
    PermissionRepository,
    UserRepository,
  ],
  exports: [UserGroupRepository],
})
export class UserGroupModule {}
