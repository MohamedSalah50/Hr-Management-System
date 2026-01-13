import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import {
  PermissionModel,
  PermissionRepository,
  RoleModel,
  RoleRepository,
} from 'src/db';

@Module({
  imports: [RoleModel, PermissionModel],
  controllers: [RoleController],
  providers: [RoleService, PermissionRepository, RoleRepository],
})
export class RoleModule {}
