import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionRepository } from 'src/db';
import { Types } from 'mongoose';

@Injectable()
export class PermissionsService {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async create(createPermissionDto: CreatePermissionDto) {
    // Check if permission already exists
    const existing = await this.permissionRepository.findOne({
      filter: { name: createPermissionDto.name },
    });

    if (existing) {
      throw new ConflictException('الصلاحية موجودة بالفعل');
    }

    const permission = await this.permissionRepository.create({
      data: [{ ...createPermissionDto }],
    });

    return {
      message: 'تم إضافة الصلاحية بنجاح',
      data: permission,
    };
  }

  async findAll() {
    const permissions = await this.permissionRepository.find({ filter: {} });
    return {
      data: permissions,
      total: permissions.length,
    };
  }

  async findOne(id: Types.ObjectId) {
    const permission = await this.permissionRepository.findById({ id });

    if (!permission) {
      throw new NotFoundException('الصلاحية غير موجودة');
    }

    return { data: permission };
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto) {
    const permission = await this.permissionRepository.findOneAndUpdate({
      filter: { _id: id },
      update: updatePermissionDto,
    });

    if (!permission) {
      throw new NotFoundException('الصلاحية غير موجودة');
    }

    return {
      message: 'تم تعديل الصلاحية بنجاح',
      data: permission,
    };
  }

  async remove(id: string) {
    const permission = await this.permissionRepository.findOneAndDelete({
      filter: { _id: id },
    });

    if (!permission) {
      throw new NotFoundException('الصلاحية غير موجودة');
    }

    return {
      message: 'تم حذف الصلاحية بنجاح',
    };
  }

  async findByResource(resource: string) {
    const permissions = await this.permissionRepository.find({
      filter: { resource },
    });
    return {
      data: permissions,
      total: permissions.length,
    };
  }
}
