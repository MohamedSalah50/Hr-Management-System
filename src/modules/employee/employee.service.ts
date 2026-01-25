import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { DepartmentRepository, EmployeeRepository } from 'src/db';
import { Types } from 'mongoose';
import { filter } from 'rxjs';

@Injectable()
export class EmployeeService {
  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly departmentRepository: DepartmentRepository,
  ) {}

  /**
   * Create Employee - إضافة موظف
   * Validation Rules من PDF (نقطة 4)
   */
  async create(createEmployeeDto: CreateEmployeeDto) {
    // Validation Rule #2: Check if all required fields are filled
    const requiredFields = [
      'fullName',
      'nationalId',
      'phone',
      'address',
      'birthDate',
      'gender',
      'nationality',
      'contractDate',
      'baseSalary',
      'checkInTime',
      'checkOutTime',
      'departmentId',
    ];

    for (const field of requiredFields) {
      if (!createEmployeeDto[field]) {
        throw new BadRequestException('هذا الحقل مطلوب');
      }
    }

    // Check if national ID already exists
    const existingEmployee = await this.employeeRepository.findOne({
      filter: {
        $or: [
          { nationalId: createEmployeeDto.nationalId },
          { fullName: createEmployeeDto.fullName },
        ],
      },
    });

    if (existingEmployee) {
      throw new ConflictException(
        'الرقم القومي مسجل بالفعل او الاسم مسجل بالفعل',
      );
    }

    // Validation Rule #4: Check age (minimum 20 years)
    const birthDate = new Date(createEmployeeDto.birthDate);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    if (age < 20) {
      throw new BadRequestException('يجب الا يقل عمر الموظف عن 20 سنة');
    }

    // Validation Rule #6: Check contract date (after company start date 2008)
    const contractDate = new Date(createEmployeeDto.contractDate);
    const companyStartDate = new Date('2008-01-01');
    if (contractDate < companyStartDate) {
      throw new BadRequestException('من فضلك ادخل تاريخ تعاقد صحيح');
    }

    // Check if department exists
    const department = await this.departmentRepository.findOne({
      filter: { _id: createEmployeeDto.departmentId },
    });

    if (!department) {
      throw new BadRequestException('القسم غير موجود');
    }

    // Validation Rule #1: Create employee successfully
    const employee = await this.employeeRepository.create({
      data: [
        {
          ...createEmployeeDto,
          birthDate: new Date(createEmployeeDto.birthDate),
          contractDate: new Date(createEmployeeDto.contractDate),
          departmentId: new Types.ObjectId(createEmployeeDto.departmentId),
          isActive: true,
        },
      ],
    });

    return {
      message: 'تم إضافة الموظف بنجاح',
      data: employee,
    };
  }

  async findAll() {
    const employees = await this.employeeRepository.find({
      filter: {},
      options: {
        populate: [{ path: 'departmentId', select: 'name description' }],
      },
    });

    return {
      data: employees,
      total: employees.length,
    };
  }

  async findOne(id: string) {
    const employees = await this.employeeRepository.find({
      filter: { _id: id },
      options: { populate: [{ path: 'departmentId' }] },
    });

    if (!employees || employees.length === 0) {
      throw new NotFoundException('الموظف غير موجود');
    }

    return {
      data: employees[0],
    };
  }

  async update(id: Types.ObjectId, updateEmployeeDto: UpdateEmployeeDto) {
    const existingEmployee = await this.employeeRepository.findOne({
      filter: { _id: id },
    });

    if (!existingEmployee) {
      throw new NotFoundException('الموظف غير موجود');
    }

    // Check if national ID is being changed and already exists
    if (
      updateEmployeeDto.nationalId &&
      updateEmployeeDto.nationalId !== existingEmployee.nationalId
    ) {
      const nationalIdExists = await this.employeeRepository.findOne({
        filter: {
          nationalId: updateEmployeeDto.nationalId,
          _id: { $ne: id },
        },
      });

      if (nationalIdExists) {
        throw new ConflictException('الرقم القومي مسجل بالفعل');
      }
    }

    // Validate birth date if provided
    if (updateEmployeeDto.birthDate) {
      const birthDate = new Date(updateEmployeeDto.birthDate);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      if (age < 20) {
        throw new BadRequestException('يجب الا يقل عمر الموظف عن 20 سنة');
      }
    }

    // Validate contract date if provided
    if (updateEmployeeDto.contractDate) {
      const contractDate = new Date(updateEmployeeDto.contractDate);
      const companyStartDate = new Date('2008-01-01');
      if (contractDate < companyStartDate) {
        throw new BadRequestException('من فضلك ادخل تاريخ تعاقد صحيح');
      }
    }

    // Check if department exists if being updated
    if (updateEmployeeDto.departmentId) {
      const department = await this.departmentRepository.findOne({
        filter: { _id: updateEmployeeDto.departmentId },
      });

      if (!department) {
        throw new BadRequestException('القسم غير موجود');
      }

      updateEmployeeDto.departmentId = new Types.ObjectId(
        updateEmployeeDto.departmentId,
      ) as any;
    }

    // Convert date strings to Date objects
    if (updateEmployeeDto.birthDate) {
      updateEmployeeDto.birthDate = new Date(
        updateEmployeeDto.birthDate,
      ) as any;
    }
    if (updateEmployeeDto.contractDate) {
      updateEmployeeDto.contractDate = new Date(
        updateEmployeeDto.contractDate,
      ) as any;
    }

    const updatedEmployee = await this.employeeRepository.findOneAndUpdate({
      filter: { _id: id },
      update: { $set: updateEmployeeDto },
    });

    return {
      message: 'تم تعديل بيانات الموظف بنجاح',
      data: updatedEmployee,
    };
  }

  async remove(id: string) {
    const employee = await this.employeeRepository.findOneAndDelete({
      filter: { _id: id },
    });

    if (!employee) {
      throw new NotFoundException('الموظف غير موجود');
    }

    return {
      message: 'تم حذف الموظف بنجاح',
    };
  }

  /**
   * Search Employees - البحث عن الموظفين
   */
  async search(query: string) {
    const employees = await this.employeeRepository.find({
      filter: {
        $or: [
          { fullName: { $regex: query, $options: 'i' } },
          { nationalId: { $regex: query, $options: 'i' } },
          { phone: { $regex: query, $options: 'i' } },
        ],
      },
      options: { populate: [{ path: 'departmentId', select: 'name' }] },
    });

    return {
      data: employees,
      total: employees.length,
    };
  }

  /**
   * Get Employees by Department - عرض موظفين حسب القسم
   */
  async getByDepartment(departmentId: string) {
    const employees = await this.employeeRepository.find({
      filter: { _id: departmentId },
      options: {
        populate: [{ path: 'departmentId', select: 'name description' }],
      },
    });

    return {
      data: employees,
      total: employees.length,
    };
  }

  /**
   * Toggle Employee Status - تفعيل/إلغاء تفعيل الموظف
   */
  async toggleStatus(id: Types.ObjectId) {
    const employee = await this.employeeRepository.findOne({
      filter: { _id: id },
    });

    if (!employee) {
      throw new NotFoundException('الموظف غير موجود');
    }

    const updatedEmployee = await this.employeeRepository.findOneAndUpdate({
      filter: { _id: id },
      update: { $set: { isActive: !employee.isActive } },
    });

    if (!updatedEmployee) {
      throw new NotFoundException('الموظف غير موجود');
    }

    return {
      message: `تم ${updatedEmployee.isActive ? 'تفعيل' : 'إلغاء تفعيل'} الموظف بنجاح`,
      data: {
        id: updatedEmployee._id,
        isActive: updatedEmployee.isActive,
      },
    };
  }
}
