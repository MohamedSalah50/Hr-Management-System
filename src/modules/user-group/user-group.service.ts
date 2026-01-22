// user-groups.service.ts

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Types, isValidObjectId } from 'mongoose';
import {
  PermissionRepository,
  UserGroupRepository,
  UserRepository,
} from 'src/db';
import { CreateUserGroupDto } from './dto/create-user-group.dto';
import { UpdateUserGroupDto } from './dto/update-user-group.dto';

@Injectable()
export class UserGroupsService {
  constructor(
    private readonly userGroupRepository: UserGroupRepository,
    private readonly permissionRepository: PermissionRepository,
    private readonly userRepository: UserRepository,
  ) {}

  // إضافة مجموعة جديدة
  async create(createUserGroupDto: CreateUserGroupDto) {
    // التحقق من وجود المجموعة
    const existing = await this.userGroupRepository.findOne({
      filter: { name: createUserGroupDto.name },
    });

    if (existing) {
      throw new ConflictException('المجموعة موجودة بالفعل');
    }

    // التحقق من أن الصلاحيات موجودة
    if (createUserGroupDto.permissions?.length > 0) {
      const permissions = await this.permissionRepository.find({
        filter: { _id: { $in: createUserGroupDto.permissions } },
      });

      if (permissions.length !== createUserGroupDto.permissions.length) {
        throw new NotFoundException('بعض الصلاحيات غير موجودة');
      }
    }

    const userGroup = await this.userGroupRepository.create({
      data: [
        {
          name: createUserGroupDto.name,
          description: createUserGroupDto.description,
          permissions: createUserGroupDto.permissions || [],
          userIds: createUserGroupDto.userIds || [],
        },
      ],
    });

    return {
      message: 'تم إضافة المجموعة بنجاح',
      data: userGroup,
    };
  }

  // عرض كل المجموعات
  async findAll() {
    const userGroups = await this.userGroupRepository.find({
      filter: {},
      options: {
        populate: [
          { path: 'permissions', select: 'name resource action' },
          { path: 'userIds', select: 'fullName email' },
        ],
      },
    });

    return {
      data: userGroups,
      total: userGroups.length,
    };
  }

  // عرض مجموعة واحدة
  async findOne(id: Types.ObjectId) {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('المعرف غير صالح');
    }

    const userGroup = await this.userGroupRepository.findOne({
      filter: { _id: id },
      options: {
        populate: [
          { path: 'permissions', select: 'name resource action' },
          { path: 'userIds', select: 'fullName email' },
        ],
      },
    });

    if (!userGroup) {
      throw new NotFoundException('المجموعة غير موجودة');
    }

    return { data: userGroup };
  }

  // تعديل مجموعة
  async update(id: Types.ObjectId, updateUserGroupDto: UpdateUserGroupDto) {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('المعرف غير صالح');
    }

    // التحقق من أن المجموعة موجودة
    const existing = await this.userGroupRepository.findOne({
      filter: { _id: id },
    });

    if (!existing) {
      throw new NotFoundException('المجموعة غير موجودة');
    }

    // التحقق من الصلاحيات إذا تم تحديثها
    if (
      updateUserGroupDto.permissions &&
      updateUserGroupDto.permissions?.length > 0
    ) {
      const permissions = await this.permissionRepository.find({
        filter: { _id: { $in: updateUserGroupDto.permissions } },
      });

      if (permissions.length !== updateUserGroupDto.permissions.length) {
        throw new NotFoundException('بعض الصلاحيات غير موجودة');
      }
    }

    const userGroup = await this.userGroupRepository.findOneAndUpdate({
      filter: { _id: id },
      update: updateUserGroupDto,
    });

    return {
      message: 'تم تعديل المجموعة بنجاح',
      data: userGroup,
    };
  }

  // حذف مجموعة
  async remove(id: Types.ObjectId) {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('المعرف غير صالح');
    }

    const userGroup = await this.userGroupRepository.findOneAndDelete({
      filter: { _id: id },
    });

    if (!userGroup) {
      throw new NotFoundException('المجموعة غير موجودة');
    }

    return {
      message: 'تم حذف المجموعة بنجاح',
    };
  }

  // إضافة مستخدمين للمجموعة
  async addUsers(groupId: Types.ObjectId, userIds: string[]) {
    if (!isValidObjectId(groupId)) {
      throw new NotFoundException('المعرف غير صالح');
    }

    const group = await this.userGroupRepository.findOne({
      filter: { _id: groupId },
    });

    if (!group) {
      throw new NotFoundException('المجموعة غير موجودة');
    }

    // التحقق من وجود المستخدمين
    const users = await this.userRepository.find({
      filter: { _id: { $in: userIds } },
    });

    if (users.length !== userIds.length) {
      throw new NotFoundException('بعض المستخدمين غير موجودين');
    }

    // إضافة المستخدمين (تجنب التكرار)
    const existingUserIds = group.userIds.map((id) => id.toString());
    const newUserIds = userIds.filter((id) => !existingUserIds.includes(id));

    const updatedGroup = await this.userGroupRepository.findOneAndUpdate({
      filter: { _id: groupId },
      update: {
        $addToSet: { userIds: { $each: newUserIds } },
      },
    });

    return {
      message: 'تم إضافة المستخدمين بنجاح',
      data: updatedGroup,
    };
  }

  // إزالة مستخدمين من المجموعة
  async removeUsers(groupId: Types.ObjectId, userIds: string[]) {
    if (!isValidObjectId(groupId)) {
      throw new NotFoundException('المعرف غير صالح');
    }

    const updatedGroup = await this.userGroupRepository.findOneAndUpdate({
      filter: { _id: groupId },
      update: {
        $pull: { userIds: { $in: userIds } },
      },
    });

    if (!updatedGroup) {
      throw new NotFoundException('المجموعة غير موجودة');
    }

    return {
      message: 'تم إزالة المستخدمين بنجاح',
      data: updatedGroup,
    };
  }

  // إضافة صلاحيات للمجموعة
  async addPermissions(groupId: Types.ObjectId, permissionIds: string[]) {
    if (!isValidObjectId(groupId)) {
      throw new NotFoundException('المعرف غير صالح');
    }

    const group = await this.userGroupRepository.findOne({
      filter: { _id: groupId },
    });

    if (!group) {
      throw new NotFoundException('المجموعة غير موجودة');
    }

    // التحقق من وجود الصلاحيات
    const permissions = await this.permissionRepository.find({
      filter: { _id: { $in: permissionIds } },
    });

    if (permissions.length !== permissionIds.length) {
      throw new NotFoundException('بعض الصلاحيات غير موجودة');
    }

    // إضافة الصلاحيات (تجنب التكرار)
    const existingPermIds = group.permissions.map((id) => id.toString());
    const newPermIds = permissionIds.filter(
      (id) => !existingPermIds.includes(id),
    );

    const updatedGroup = await this.userGroupRepository.findOneAndUpdate({
      filter: { _id: groupId },
      update: {
        $addToSet: { permissions: { $each: newPermIds } },
      },
    });

    return {
      message: 'تم إضافة الصلاحيات بنجاح',
      data: updatedGroup,
    };
  }

  // إزالة صلاحيات من المجموعة
  async removePermissions(groupId: Types.ObjectId, permissionIds: string[]) {
    if (!isValidObjectId(groupId)) {
      throw new NotFoundException('المعرف غير صالح');
    }

    const updatedGroup = await this.userGroupRepository.findOneAndUpdate({
      filter: { _id: groupId },
      update: {
        $pull: { permissions: { $in: permissionIds } },
      },
    });

    if (!updatedGroup) {
      throw new NotFoundException('المجموعة غير موجودة');
    }

    return {
      message: 'تم إزالة الصلاحيات بنجاح',
      data: updatedGroup,
    };
  }
}
