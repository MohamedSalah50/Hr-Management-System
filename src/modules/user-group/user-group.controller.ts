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
  constructor(private readonly userGroupsService: UserGroupsService) {}

  // إضافة مجموعة
  @Post()
  create(@Body() createUserGroupDto: CreateUserGroupDto) {
    return this.userGroupsService.create(createUserGroupDto);
  }

  // عرض كل المجموعات
  @Get()
  findAll() {
    return this.userGroupsService.findAll();
  }

  // عرض مجموعة واحدة
  @Get(':id')
  findOne(@Param('id') id: Types.ObjectId) {
    return this.userGroupsService.findOne(id);
  }

  // تعديل مجموعة
  @Patch(':id')
  update(
    @Param('id') id: Types.ObjectId,
    @Body() updateUserGroupDto: UpdateUserGroupDto,
  ) {
    return this.userGroupsService.update(id, updateUserGroupDto);
  }

  // حذف مجموعة
  @Delete(':id')
  remove(@Param('id') id: Types.ObjectId) {
    return this.userGroupsService.remove(id);
  }

  // إضافة مستخدمين للمجموعة
  @Post(':id/users')
  addUsers(
    @Param('id') id: Types.ObjectId,
    @Body('userIds') userIds: string[],
  ) {
    return this.userGroupsService.addUsers(id, userIds);
  }

  // إزالة مستخدمين من المجموعة
  @Delete(':id/users')
  removeUsers(
    @Param('id') id: Types.ObjectId,
    @Body('userIds') userIds: string[],
  ) {
    return this.userGroupsService.removeUsers(id, userIds);
  }

  // إضافة صلاحيات للمجموعة
  @Post(':id/permissions')
  addPermissions(
    @Param('id') id: Types.ObjectId,
    @Body('permissions') permissions: string[],
  ) {
    return this.userGroupsService.addPermissions(id, permissions);
  }

  // إزالة صلاحيات من المجموعة
  @Delete(':id/permissions')
  removePermissions(
    @Param('id') id: Types.ObjectId,
    @Body('permissions') permissions: string[],
  ) {
    return this.userGroupsService.removePermissions(id, permissions);
  }
}
