import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentRepository } from 'src/db';
import { Types } from 'mongoose';

@Injectable()
export class DepartmentService {
  constructor(private readonly departmentRepository: DepartmentRepository) {}
  async create(createDepartmentDto: CreateDepartmentDto) {
    const existing = await this.departmentRepository.findOne({
      filter: { name: createDepartmentDto.name },
    });

    if (existing) {
      throw new ConflictException('القسم موجود بالفعل');
    }

    const department = await this.departmentRepository.create({
      data: [{ ...createDepartmentDto }],
    });

    return {
      message: 'تم إضافة القسم بنجاح',
      data: department,
    };
  }

  async findAll() {
    const departments = await this.departmentRepository.find({ filter: {} });
    return {
      data: departments,
      total: departments.length,
    };
  }

  async findOne(id: Types.ObjectId) {
    const department = await this.departmentRepository.findOne({
      filter: { _id: id },
    });

    if (!department) {
      throw new NotFoundException('القسم غير موجود');
    }

    return { data: department };
  }

  async update(id: Types.ObjectId, updateDepartmentDto: UpdateDepartmentDto) {
    const existDepartmentName = await this.departmentRepository.findOne({
      filter: { name: updateDepartmentDto.name },
    });

    if (existDepartmentName) {
      throw new ConflictException('القسم موجود بالفعل');
    }

    const department = await this.departmentRepository.findOneAndUpdate({
      filter: { _id: id },
      update: updateDepartmentDto,
    });

    if (!department) {
      throw new NotFoundException('القسم غير موجود');
    }

    return {
      message: 'تم تعديل القسم بنجاح',
      data: department,
    };
  }

  async remove(id: Types.ObjectId) {
    const department = await this.departmentRepository.findOneAndDelete({
      filter: { _id: id },
    });

    if (!department) {
      throw new NotFoundException('القسم غير موجود');
    }

    return {
      message: 'تم حذف القسم بنجاح',
    };
  }
}
