import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { DepartmentRepository, EmployeeRepository, UserRepository } from 'src/db';
import { Types } from 'mongoose';
import { PermissionsEnum } from 'src/common';
// import { PermissionCheckerHelper } from 'src/common/helpers/permission-checker.helper';


@Injectable()
export class EmployeeService {
  constructor(
    // private readonly permissionCheckerHelper: PermissionCheckerHelper,
    private readonly employeeRepository: EmployeeRepository,
    private readonly departmentRepository: DepartmentRepository,
    private readonly userRepository: UserRepository
  ) { }


  async create(createEmployeeDto: CreateEmployeeDto) {

    const user = await this.userRepository.findOne({
      filter: { _id: new Types.ObjectId(createEmployeeDto.userId) },
      options: {
        populate: {
          path: 'userGroupId',
          select: 'name permissions',
          populate: {
            path: 'permissions',
            select: 'resource action name',
          },
        },
      },
    });

    if (!user) {
      throw new ForbiddenException('المستخدم غير موجود');
    }

    const userGroup = user.userGroupId as any;

    if (!userGroup) {
      throw new ForbiddenException(
        'ليس لديك مجموعة صلاحيات. يرجى التواصل مع المسؤول',
      );
    }

    const permissions = userGroup.permissions || [];

    const hasPermission = permissions.some(
      (perm: any) =>
        perm.resource === "employees" && perm.action === PermissionsEnum.create,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `ليس لديك صلاحية لانشاء موظف. يرجى التواصل مع المسؤول`,
      );
    }

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

    const existingEmployee = await this.employeeRepository.findOne({
      filter: { nationalId: createEmployeeDto.nationalId }
    });

    if (existingEmployee) {
      throw new ConflictException(
        'الرقم القومي مسجل بالفعل ',
      );
    }

    const birthDate = new Date(createEmployeeDto.birthDate);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    if (age < 20) {
      throw new BadRequestException('يجب الا يقل عمر الموظف عن 20 سنة');
    }

    const contractDate = new Date(createEmployeeDto.contractDate);
    const companyStartDate = new Date('2008-01-01');
    if (contractDate < companyStartDate) {
      throw new BadRequestException('من فضلك ادخل تاريخ تعاقد صحيح');
    }

    const department = await this.departmentRepository.findOne({
      filter: { _id: createEmployeeDto.departmentId },
    });

    if (!department) {
      throw new BadRequestException('القسم غير موجود');
    }

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

  async findAll(userId: Types.ObjectId) {
    const user = await this.userRepository.findOne({
      filter: { _id: userId },
      options: {
        populate: {
          path: 'userGroupId',
          select: 'name permissions',
          populate: {
            path: 'permissions',
            select: 'resource action name',
          },
        },
      },
    });

    if (!user) {
      throw new ForbiddenException('المستخدم غير موجود');
    }

    const userGroup = user.userGroupId as any;

    if (!userGroup) {
      throw new ForbiddenException(
        'ليس لديك مجموعة صلاحيات. يرجى التواصل مع المسؤول',
      );
    }

    const permissions = userGroup.permissions || [];

    const hasPermission = permissions.some(
      (perm: any) =>
        perm.resource === "employees" && perm.action === PermissionsEnum.delete,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `ليس لديك صلاحية للاطلاع علي  الموظفين . يرجى التواصل مع المسؤول`,
      );
    }
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

  async findOne(id: string, userId: string) {


    const user = await this.userRepository.findOne({
      filter: { _id: new Types.ObjectId(userId) },
      options: {
        populate: {
          path: 'userGroupId',
          select: 'name permissions',
          populate: {
            path: 'permissions',
            select: 'resource action name',
          },
        },
      },
    });

    if (!user) {
      throw new ForbiddenException('المستخدم غير موجود');
    }

    const userGroup = user.userGroupId as any;

    if (!userGroup) {
      throw new ForbiddenException(
        'ليس لديك مجموعة صلاحيات. يرجى التواصل مع المسؤول',
      );
    }

    const permissions = userGroup.permissions || [];

    const hasPermission = permissions.some(
      (perm: any) =>
        perm.resource === "employees" && perm.action === PermissionsEnum.read,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `ليس لديك صلاحية للاطلاع على موظف. يرجى التواصل مع المسؤول`,
      );
    }
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

  async update(id: Types.ObjectId, userId: Types.ObjectId, updateEmployeeDto: UpdateEmployeeDto) {


    const user = await this.userRepository.findOne({
      filter: { _id: userId },
      options: {
        populate: {
          path: 'userGroupId',
          select: 'name permissions',
          populate: {
            path: 'permissions',
            select: 'resource action name',
          },
        },
      },
    });

    if (!user) {
      throw new ForbiddenException('المستخدم غير موجود');
    }

    const userGroup = user.userGroupId as any;

    if (!userGroup) {
      throw new ForbiddenException(
        'ليس لديك مجموعة صلاحيات. يرجى التواصل مع المسؤول',
      );
    }

    const permissions = userGroup.permissions || [];

    const hasPermission = permissions.some(
      (perm: any) =>
        perm.resource === "employees" && perm.action === PermissionsEnum.update,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `ليس لديك صلاحية لتعديل موظف. يرجى التواصل مع المسؤول`,
      );
    }
    const existingEmployee = await this.employeeRepository.findOne({
      filter: { _id: id },
    });

    if (!existingEmployee) {
      throw new NotFoundException('الموظف غير موجود');
    }

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

    if (updateEmployeeDto.birthDate) {
      const birthDate = new Date(updateEmployeeDto.birthDate);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      if (age < 20) {
        throw new BadRequestException('يجب الا يقل عمر الموظف عن 20 سنة');
      }
    }

    if (updateEmployeeDto.contractDate) {
      const contractDate = new Date(updateEmployeeDto.contractDate);
      const companyStartDate = new Date('2008-01-01');
      if (contractDate < companyStartDate) {
        throw new BadRequestException('من فضلك ادخل تاريخ تعاقد صحيح');
      }
    }

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

  async softDelete(id: string, userId: Types.ObjectId) {

    const user = await this.userRepository.findOne({
      filter: { _id: userId },
      options: {
        populate: {
          path: 'userGroupId',
          select: 'name permissions',
          populate: {
            path: 'permissions',
            select: 'resource action name',
          },
        },
      },
    });

    if (!user) {
      throw new ForbiddenException('المستخدم غير موجود');
    }

    const userGroup = user.userGroupId as any;

    if (!userGroup) {
      throw new ForbiddenException(
        'ليس لديك مجموعة صلاحيات. يرجى التواصل مع المسؤول',
      );
    }

    const permissions = userGroup.permissions || [];

    const hasPermission = permissions.some(
      (perm: any) =>
        perm.resource === "employees" && perm.action === PermissionsEnum.delete,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `ليس لديك صلاحية لحذف موظف. يرجى التواصل مع المسؤول`,
      );
    }
    const employee = await this.employeeRepository.findOneAndUpdate({
      filter: { _id: id, freezedAt: { $exists: false } },
      update: { freezedAt: true }

    });

    if (!employee) {
      throw new NotFoundException('الموظف غير موجود');
    }

    return {
      message: 'تم حذف الموظف بنجاح',
    };
  }


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
