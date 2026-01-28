import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PermissionRepository, RoleRepository } from 'src/db';
import { Types } from 'mongoose';

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
  ) { }
  async create(createRoleDto: CreateRoleDto) {
    // Validation Rule #3: اسم المجموعة مطلوب
    if (!createRoleDto.name || createRoleDto.name.trim() === '') {
      throw new BadRequestException('من فضلك ادخل اسم المجموعة');
    }

    if (!createRoleDto.permissions || createRoleDto.permissions.length === 0) {
      throw new BadRequestException(
        'من فضلك قم بتحديد صلاحيات المجموعة قبل الاضافة',
      );
    }

    const existing = await this.roleRepository.findOne({
      filter: { name: createRoleDto.name },
    });

    if (existing) {
      throw new ConflictException('اسم المجموعة موجود بالفعل');
    }

    const permissionIds = createRoleDto.permissions.map(
      (id) => new Types.ObjectId(id),
    );

    const permissions = await this.permissionRepository.find({
      filter: { _id: { $in: permissionIds } },
    });

    if (permissions.length !== permissionIds.length) {
      throw new BadRequestException('بعض الصلاحيات غير موجودة');
    }

    const role = await this.roleRepository.create({
      data: [
        {
          name: createRoleDto.name,
          description: createRoleDto.description,
          permissions: permissionIds,
        },
      ],
    });

    return {
      message: 'تم إضافة المجموعة بنجاح',
      data: role,
    };
  }

  async findAll() {
    const roles = await this.roleRepository.find({
      filter: {},
      options: { populate: [{ path: 'permissions' }] },
    });

    return {
      data: roles,
      total: roles.length,
    };
  }

  async findOne(id: string) {
    const role = await this.roleRepository.find({
      filter: { _id: id },
      options: { populate: [{ path: 'permissions' }] },
    });

    if (!role || role.length === 0) {
      throw new NotFoundException('المجموعة غير موجودة');
    }

    return { data: role[0] };
  }

  async update(id: Types.ObjectId, updateRoleDto: UpdateRoleDto) {
    
    const existing = await this.roleRepository.findById({ id });

    if (!existing) {
      throw new NotFoundException('المجموعة غير موجودة');
    }

    
    if (updateRoleDto.permissions && updateRoleDto.permissions.length > 0) {
      const permissionIds = updateRoleDto.permissions.map(
        (permId) => new Types.ObjectId(permId),
      );

      const permissions = await this.permissionRepository.find({
        filter: { _id: { $in: permissionIds } },
      });

      if (permissions.length !== permissionIds.length) {
        throw new BadRequestException('بعض الصلاحيات غير موجودة');
      }

      updateRoleDto.permissions = permissionIds as any;
    }

    const role = await this.roleRepository.findOneAndUpdate({
      filter: { _id: id },
      update: updateRoleDto,
    });

    return {
      message: 'تم تعديل المجموعة بنجاح',
      data: role,
    };
  }

  async softDelete(id: Types.ObjectId) {
    const role = await this.roleRepository.findOneAndUpdate({
      filter: { _id: id, freezedAt: { $exists: false } },
      update: { freezedAt: true }
    });

    if (!role) {
      throw new NotFoundException('المجموعة غير موجودة');
    }

    return {
      message: 'تم حذف المجموعة بنجاح',
    };
  }
}
