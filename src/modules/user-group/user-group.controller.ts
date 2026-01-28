// user-groups.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { RoleEnum } from 'src/common';
import { auth } from 'src/common/decorators/auth.decorator';
import { UserGroupsService } from './user-group.service';
import { CreateUserGroupDto } from './dto/create-user-group.dto';
import { UpdateUserGroupDto } from './dto/update-user-group.dto';

@auth([RoleEnum.admin, RoleEnum.superAdmin])
@Controller('user-groups')
export class UserGroupsController {
  constructor(private readonly userGroupsService: UserGroupsService) { }

  @Post()
  create(@Body() createUserGroupDto: CreateUserGroupDto) {
    return this.userGroupsService.create(createUserGroupDto);
  }

  @Get()
  findAll() {
    return this.userGroupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: Types.ObjectId) {
    return this.userGroupsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: Types.ObjectId,
    @Body() updateUserGroupDto: UpdateUserGroupDto,
  ) {
    return this.userGroupsService.update(id, updateUserGroupDto);
  }

  @Patch(':id/soft-delete')
  remove(@Param('id') id: Types.ObjectId) {
    return this.userGroupsService.softDelete(id);
  }

  @Post(':id/users')
  addUsers(
    @Param('id') id: Types.ObjectId,
    @Body('userIds') userIds: string[],
  ) {
    return this.userGroupsService.addUsers(id, userIds);
  }

  @Delete(':id/users')
  removeUsers(
    @Param('id') id: Types.ObjectId,
    @Body('userIds') userIds: string[],
  ) {
    return this.userGroupsService.removeUsers(id, userIds);
  }

  @Post(':id/permissions')
  addPermissions(
    @Param('id') id: Types.ObjectId,
    @Body('permissions') permissions: string[],
  ) {
    return this.userGroupsService.addPermissions(id, permissions);
  }

  @Delete(':id/permissions')
  removePermissions(
    @Param('id') id: Types.ObjectId,
    @Body('permissions') permissions: string[],
  ) {
    return this.userGroupsService.removePermissions(id, permissions);
  }
}
