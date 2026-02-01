import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GenerateReportDto } from './dto/generate-report.dto';
import { EmployeeRepository, SalaryReportRepository, UserRepository } from 'src/db';
import { SalaryCalculatorHelper } from './helpers/salary-calculator.helper';
import { Types } from 'mongoose';
import { SearchReportDto } from './dto/search-report.dto';
import { PermissionsEnum } from 'src/common';

@Injectable()
export class SalaryReportService {
  constructor(
    private readonly salaryReportRepository: SalaryReportRepository,
    private readonly employeeRepository: EmployeeRepository,
    private readonly salaryCalculator: SalaryCalculatorHelper,
    private readonly userRepository: UserRepository
  ) { }


  async generateReport(generateReportDto: GenerateReportDto, userId: Types.ObjectId) {

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
        perm.resource === "salaryReport" && perm.action === PermissionsEnum.create,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `ليس لديك صلاحية لاضافه تقرير الراتب. يرجى التواصل مع المسؤول`,
      );
    }
    const { employeeId, month, year } = generateReportDto;

    // Validation
    if (year < 2008) {
      throw new BadRequestException('من فضلك اختر سنة صحيحه');
    }

    if (!employeeId) {
      throw new BadRequestException('معرف الموظف مطلوب');
    }

    // Check if employee exists
    const employee = await this.employeeRepository.findOne({
      filter: { _id: employeeId },
    });

    if (!employee) {
      throw new BadRequestException('من فضلك ادخل اسم موظف صالح');
    }

    // Check if report already exists
    const existingReport = await this.salaryReportRepository.findOne({
      filter: {
        employeeId: new Types.ObjectId(employeeId),
        month,
        year,
      },
    });

    if (existingReport) {
      throw new ConflictException('التقرير موجود بالفعل لهذا الشهر والسنة');
    }

    // Get attendance statistics
    const attendanceStats = await this.salaryCalculator.getAttendanceStats(
      employeeId,
      month,
      year,
    );

    // Get working days
    const workingDays = await this.salaryCalculator.getWorkingDaysInMonth(
      month,
      year,
    );

    const baseSalary = (employee as any).baseSalary;

    // ✅ Calculate amounts with new formula (passing baseSalary and workingDays)
    const overtimeAmount = await this.salaryCalculator.calculateOvertimeAmount(
      baseSalary,
      Number(attendanceStats.overtimeHours),
      workingDays,
    );

    const deductionAmount =
      await this.salaryCalculator.calculateDeductionAmount(
        baseSalary,
        Number(attendanceStats.lateHours),
        workingDays,
      );

    // Calculate net salary
    const netSalary = await this.salaryCalculator.calculateNetSalary(
      baseSalary,
      overtimeAmount,
      deductionAmount,
      attendanceStats.daysPresent,
      attendanceStats.daysAbsent,
      workingDays,
      attendanceStats.holidays,
      attendanceStats.sickLeave,
    );

    // Create report
    const [report] = await this.salaryReportRepository.create({
      data: [
        {
          employeeId: new Types.ObjectId(employeeId),
          month,
          year,
          baseSalary,
          daysPresent: attendanceStats.daysPresent,
          daysAbsent: attendanceStats.daysAbsent,
          holidays: attendanceStats.holidays,
          sickLeave: attendanceStats.sickLeave,
          overtimeHours: Number(attendanceStats.overtimeHours.toFixed(2)),
          lateHours: Number(attendanceStats.lateHours.toFixed(2)),
          overtimeAmount,
          deductionAmount,
          netSalary,
        },
      ],
    });

    return {
      message: 'تم إنشاء تقرير الراتب بنجاح',
      data: report,
    };
  }


  // async generateReportsForAll(month: number, year: number) {
  //   // Validation
  //   if (year < 2008) {
  //     throw new BadRequestException('من فضلك اختر سنة صحيحه');
  //   }

  //   const employees = await this.employeeRepository.find({
  //     filter: { isActive: true },
  //   });

  //   // ✅ FIX: Define proper types
  //   const results: {
  //     success: Array<{
  //       employeeId: Types.ObjectId;
  //       employeeName: string;
  //       report: any;
  //     }>;
  //     failed: Array<{
  //       employeeId: Types.ObjectId;
  //       employeeName: string;
  //       error: string;
  //     }>;
  //   } = {
  //     success: [],
  //     failed: [],
  //   };

  //   // ✅ Type assertion
  //   const typedEmployees = employees as any[];

  //   for (const employee of typedEmployees) {
  //     try {
  //       const report = await this.generateReport({
  //         employeeId: employee._id.toString(),
  //         month,
  //         year,
  //         userId: employee._id,
  //       });

  //       results.success.push({
  //         employeeId: employee._id,
  //         employeeName: employee.fullName,
  //         report: report.data,
  //       });
  //     } catch (error) {
  //       results.failed.push({
  //         employeeId: employee._id,
  //         employeeName: employee.fullName,
  //         error: error.message,
  //       });
  //     }
  //   }

  //   return {
  //     message: `تم إنشاء ${results.success.length} تقرير بنجاح`,
  //     data: results,
  //   };
  // }


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
        perm.resource === "salaryReport" && perm.action === PermissionsEnum.read,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `ليس لديك صلاحية للاطلاع على تقارير الرواتب. يرجى التواصل مع المسؤول`,
      );
    }

    const reports = await this.salaryReportRepository.find({
      filter: {},
      options: {
        populate: [
          {
            path: 'employeeId',
            select: 'fullName nationalId',
            populate: { path: 'departmentId', select: 'name' },
          },
        ],
        sort: { year: -1, month: -1 },
      },
    });

    return {
      data: reports,
      total: reports.length,
    };
  }


  async findOne(id: string, userId: Types.ObjectId) {

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
        perm.resource === "salaryReport" && perm.action === PermissionsEnum.read,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `ليس لديك صلاحية للاطلاع علي هذا التقرير. يرجى التواصل مع المسؤول`,
      );
    }
    const reports = await this.salaryReportRepository.find({
      filter: { _id: id },
      options: {
        populate: {
          path: 'employeeId',
          select: 'fullName nationalId',
          populate: { path: 'departmentId', select: 'name' },
        },
      },
    });

    if (!reports || reports.length === 0) {
      throw new NotFoundException('التقرير غير موجود');
    }

    return {
      data: reports[0],
    };
  }


  async search(searchDto: SearchReportDto) {
    const filter: any = {};

    // Search by employee
    if (searchDto.employeeId) {
      const employee = await this.employeeRepository.findOne({
        filter: { _id: searchDto.employeeId },
      });

      if (!employee) {
        // Validation Rule #1: Invalid employee
        throw new BadRequestException('من فضلك ادخل اسم موظف صالح');
      }

      filter.employeeId = new Types.ObjectId(searchDto.employeeId);
    }

    // Search by month
    if (searchDto.month) {
      filter.month = searchDto.month;
    }

    // Search by year
    if (searchDto.year) {
      // Validation Rule #2: Year validation
      if (searchDto.year < 2008) {
        throw new BadRequestException('من فضلك اختر سنة صحيحه');
      }
      filter.year = searchDto.year;
    }

    const reports = await this.salaryReportRepository.find({
      filter,
      options: {
        populate: [
          {
            path: 'employeeId',
            select: 'fullName nationalId',
            populate: { path: 'departmentId', select: 'name' },
          },
        ],
        sort: { year: -1, month: -1 },
      },
    });

    return {
      data: reports,
      total: reports.length,
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
        perm.resource === "salaryReport" && perm.action === PermissionsEnum.delete,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `ليس لديك صلاحية لحذف تقرير الراتب. يرجى التواصل مع المسؤول`,
      );
    }
    const report = await this.salaryReportRepository.findOneAndUpdate({
      filter: { _id: id, freezedAt: { $exists: true } },
      update: { freezedAt: true }
    });

    if (!report) {
      throw new NotFoundException('التقرير غير موجود');
    }

    return {
      message: 'تم حذف التقرير بنجاح',
    };
  }


  // async regenerateReport(generateReportDto: GenerateReportDto) {
  //   const { employeeId, month, year } = generateReportDto;

  //   // Find and delete existing report
  //   const existingReport = await this.salaryReportRepository.findOne({
  //     filter: {
  //       employeeId: new Types.ObjectId(employeeId),
  //       month,
  //       year,
  //     },
  //   });

  //   if (existingReport) {
  //     await this.salaryReportRepository.findOneAndDelete({
  //       filter: { _id: existingReport._id.toString() },
  //     });
  //   }

  //   // Generate new report
  //   return await this.generateReport(generateReportDto);
  // }


  async getSummary(month: number, year: number) {
    const reports = await this.salaryReportRepository.find({
      filter: { month, year },
    });

    // ✅ Type assertion
    const typedReports = reports as any[];

    const summary = {
      totalEmployees: typedReports.length,
      totalBaseSalary: typedReports.reduce((sum, r) => sum + r.baseSalary, 0),
      totalOvertimeAmount: typedReports.reduce(
        (sum, r) => sum + r.overtimeAmount,
        0,
      ),
      totalDeductionAmount: typedReports.reduce(
        (sum, r) => sum + r.deductionAmount,
        0,
      ),
      totalNetSalary: typedReports.reduce((sum, r) => sum + r.netSalary, 0),
      totalOvertimeHours: typedReports.reduce(
        (sum, r) => sum + r.overtimeHours,
        0,
      ),
      totalLateHours: typedReports.reduce((sum, r) => sum + r.lateHours, 0),
      totalDaysPresent: typedReports.reduce((sum, r) => sum + r.daysPresent, 0),
      totalDaysAbsent: typedReports.reduce((sum, r) => sum + r.daysAbsent, 0),
    };

    return {
      data: {
        month,
        year,
        ...summary,
      },
    };
  }


  // async getReportForPrint(id: string) {
  //   const result = await this.findOne(id);
  //   const report = result.data as any;

  //   return {
  //     data: {
  //       employeeName: report.employeeId?.fullName || '',
  //       nationalId: report.employeeId?.nationalId || '',
  //       department: report.employeeId?.departmentId?.name || '',
  //       month: report.month,
  //       year: report.year,
  //       baseSalary: report.baseSalary,
  //       daysPresent: report.daysPresent,
  //       daysAbsent: report.daysAbsent,
  //       overtimeHours: report.overtimeHours,
  //       lateHours: report.lateHours,
  //       overtimeAmount: report.overtimeAmount,
  //       deductionAmount: report.deductionAmount,
  //       netSalary: report.netSalary,
  //       generatedDate: new Date().toLocaleDateString('ar-EG'),
  //     },
  //   };
  // }`
}
