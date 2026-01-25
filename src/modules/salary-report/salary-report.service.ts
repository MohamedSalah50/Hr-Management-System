import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { GenerateReportDto } from './dto/generate-report.dto';
import { EmployeeRepository, SalaryReportRepository } from 'src/db';
import { SalaryCalculatorHelper } from './helpers/salary-calculator.helper';
import { Types } from 'mongoose';
import { SearchReportDto } from './dto/search-report.dto';

@Injectable()
export class SalaryReportService {
  constructor(
    private readonly salaryReportRepository: SalaryReportRepository,
    private readonly employeeRepository: EmployeeRepository,
    private readonly salaryCalculator: SalaryCalculatorHelper,
  ) { }

  /**
   * Generate Salary Report for Single Employee
   */
  async generateReport(generateReportDto: GenerateReportDto) {
    const { employeeId, month, year } = generateReportDto;

    // Validation Rule #2: Year validation
    if (year < 2008) {
      throw new BadRequestException('من فضلك اختر سنة صحيحه');
    }

    // ✅ FIX: Check if employeeId exists
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

    // ✅ FIX: Type assertion for overtime and late hours
    const overtimeAmount = await this.salaryCalculator.calculateOvertimeAmount(
      Number(attendanceStats.overtimeHours),
    );
    const deductionAmount = await this.salaryCalculator.calculateDeductionAmount(
      Number(attendanceStats.lateHours),
    );

    // Get working days
    const workingDays = await this.salaryCalculator.getWorkingDaysInMonth(
      month,
      year,
    );

    // Calculate net salary
    const netSalary = await this.salaryCalculator.calculateNetSalary(
      (employee as any).baseSalary,
      overtimeAmount,
      deductionAmount,
      attendanceStats.daysPresent,
      attendanceStats.daysAbsent,
      workingDays,
      attendanceStats.holidays,
      attendanceStats.sickLeave,
    );

    // ✅ FIX: Get first element from create result
    const [report] = await this.salaryReportRepository.create({
      data: [
        {
          employeeId: new Types.ObjectId(employeeId),
          month,
          year,
          baseSalary: (employee as any).baseSalary,
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

  /**
   * Generate Reports for All Employees
   */
  async generateReportsForAll(month: number, year: number) {
    // Validation
    if (year < 2008) {
      throw new BadRequestException('من فضلك اختر سنة صحيحه');
    }

    const employees = await this.employeeRepository.find({
      filter: { isActive: true },
    });

    // ✅ FIX: Define proper types
    const results: {
      success: Array<{
        employeeId: Types.ObjectId;
        employeeName: string;
        report: any;
      }>;
      failed: Array<{
        employeeId: Types.ObjectId;
        employeeName: string;
        error: string;
      }>;
    } = {
      success: [],
      failed: [],
    };

    // ✅ Type assertion
    const typedEmployees = employees as any[];

    for (const employee of typedEmployees) {
      try {
        const report = await this.generateReport({
          employeeId: employee._id.toString(),
          month,
          year,
        });

        results.success.push({
          employeeId: employee._id,
          employeeName: employee.fullName,
          report: report.data,
        });
      } catch (error) {
        results.failed.push({
          employeeId: employee._id,
          employeeName: employee.fullName,
          error: error.message,
        });
      }
    }

    return {
      message: `تم إنشاء ${results.success.length} تقرير بنجاح`,
      data: results,
    };
  }

  /**
   * Find All Salary Reports
   */
  async findAll() {
    const reports = await this.salaryReportRepository.find(
      { filter: {}, options: { populate: [{ path: 'employeeId', select: 'fullName nationalId', populate: { path: 'departmentId', select: 'name' } }], sort: { year: -1, month: -1 } } },
    );

    return {
      data: reports,
      total: reports.length,
    };
  }

  /**
   * Find One Salary Report
   */
  async findOne(id: string) {
    const reports = await this.salaryReportRepository.find(
      { filter: { _id: id }, options: { populate: { path: 'employeeId', select: 'fullName nationalId', populate: { path: 'departmentId', select: 'name' } } } },
    );

    if (!reports || reports.length === 0) {
      throw new NotFoundException('التقرير غير موجود');
    }

    return {
      data: reports[0],
    };
  }

  /**
   * Search Salary Reports
   */
  async search(searchDto: SearchReportDto) {
    const filter: any = {};

    // Search by employee
    if (searchDto.employeeId) {
      const employee = await this.employeeRepository.findOne(
        {
          filter: { _id: searchDto.employeeId },
        }
      );

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

    const reports = await this.salaryReportRepository.find(
      {
        filter,
        options: {
          populate: [{ path: 'employeeId', select: 'fullName nationalId', populate: { path: 'departmentId', select: 'name' } }],
          sort: { year: -1, month: -1 }
        }
      }
    );

    return {
      data: reports,
      total: reports.length,
    };
  }

  /**
   * Delete Salary Report
   */
  async remove(id: string) {
    const report = await this.salaryReportRepository.findOneAndDelete({ filter: { _id: id } });

    if (!report) {
      throw new NotFoundException('التقرير غير موجود');
    }

    return {
      message: 'تم حذف التقرير بنجاح',
    };
  }

  /**
   * Regenerate Report (Delete old and create new)
   */
  async regenerateReport(generateReportDto: GenerateReportDto) {
    const { employeeId, month, year } = generateReportDto;

    // Find and delete existing report
    const existingReport = await this.salaryReportRepository.findOne({
      filter: {
        employeeId: new Types.ObjectId(employeeId),
        month,
        year,
      }
    });

    if (existingReport) {
      await this.salaryReportRepository.findOneAndDelete(
        { filter: { _id: existingReport._id.toString() } },
      );
    }

    // Generate new report
    return await this.generateReport(generateReportDto);
  }

  /**
   * Get Report Summary for a Period
   */
  async getSummary(month: number, year: number) {
    const reports = await this.salaryReportRepository.find({
      filter: { month, year },
    });

    // ✅ Type assertion
    const typedReports = reports as any[];

    const summary = {
      totalEmployees: typedReports.length,
      totalBaseSalary: typedReports.reduce((sum, r) => sum + r.baseSalary, 0),
      totalOvertimeAmount: typedReports.reduce((sum, r) => sum + r.overtimeAmount, 0),
      totalDeductionAmount: typedReports.reduce((sum, r) => sum + r.deductionAmount, 0),
      totalNetSalary: typedReports.reduce((sum, r) => sum + r.netSalary, 0),
      totalOvertimeHours: typedReports.reduce((sum, r) => sum + r.overtimeHours, 0),
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

  /**
   * Export Report to PDF-ready format
   * (Frontend will handle actual PDF generation)
   */
  async getReportForPrint(id: string) {
    const result = await this.findOne(id);
    const report = result.data as any;

    return {
      data: {
        employeeName: report.employeeId?.fullName || '',
        nationalId: report.employeeId?.nationalId || '',
        department: report.employeeId?.departmentId?.name || '',
        month: report.month,
        year: report.year,
        baseSalary: report.baseSalary,
        daysPresent: report.daysPresent,
        daysAbsent: report.daysAbsent,
        overtimeHours: report.overtimeHours,
        lateHours: report.lateHours,
        overtimeAmount: report.overtimeAmount,
        deductionAmount: report.deductionAmount,
        netSalary: report.netSalary,
        generatedDate: new Date().toLocaleDateString('ar-EG'),
      },
    };
  }
}
 