import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import {
  AttendanceRepository,
  EmployeeRepository,
  OfficialHolidayRepository,
} from 'src/db';
import { AttendanceCalculatorHelper } from './helpers/attendance-calculator.helper';
import { Types } from 'mongoose';
import { AttendanceEnum } from 'src/common';
import { SearchAttendanceDto } from './dto/search-attendance.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly attendanceRepository: AttendanceRepository,
    private readonly employeeRepository: EmployeeRepository,
    private readonly officialHolidayRepository: OfficialHolidayRepository,
    private readonly attendanceCalculator: AttendanceCalculatorHelper,
  ) { }

  /**
   * Create Attendance Record - إضافة سجل حضور
   */
  async create(createAttendanceDto: CreateAttendanceDto) {
    // 1. التحقق من وجود الموظف
    const employee = await this.employeeRepository.findOne({
      filter: { _id: createAttendanceDto.employeeId },
    });

    if (!employee) {
      throw new NotFoundException('الموظف غير موجود');
    }

    // 2. التحقق من عدم تكرار السجل
    const existingAttendance = await this.attendanceRepository.findOne({
      filter: {
        employeeId: new Types.ObjectId(createAttendanceDto.employeeId),
        date: new Date(createAttendanceDto.date),
      },
    });

    if (existingAttendance) {
      throw new ConflictException('سجل الحضور موجود بالفعل لهذا التاريخ');
    }

    const date = new Date(createAttendanceDto.date);

    // ============================================
    // 3. تحديد الـ Status التلقائي
    // ============================================

    let finalStatus = createAttendanceDto.status || AttendanceEnum.Precent;
    let lateHours = 0;
    let overtimeHours = 0;

    // أولاً: التحقق من الويك إند
    const isWeekend = await this.attendanceCalculator.isWeekend(date);

    // ثانياً: التحقق من الإجازات الرسمية
    const year = date.getFullYear();
    const holidays = await this.officialHolidayRepository.find({
      filter: { year },
    });
    const isHoliday = (holidays as any[]).some((holiday: any) => {
      const holidayDate = new Date(holiday.date);
      return (
        holidayDate.getDate() === date.getDate() &&
        holidayDate.getMonth() === date.getMonth()
      );
    });

    // ============================================
    // 4. Logic حسب الحالة
    // ============================================

    if (isWeekend || isHoliday) {
      // ✅ لو ويك إند أو إجازة رسمية → status = holiday (حتى لو المستخدم اختار غير كده)
      finalStatus = AttendanceEnum.Holiday;
      // لا يُحسب تأخير أو إضافي في الإجازات

    } else if (finalStatus === AttendanceEnum.Abcent) {
      // ✅ لو اختار "غائب" → مش محتاج checkIn/checkOut
      // لا يُحسب تأخير أو إضافي للغياب

    } else if (finalStatus === AttendanceEnum.Sick_leave) {
      // ✅ لو اختار "إجازة مرضية" → مش محتاج checkIn/checkOut
      // لا يُحسب تأخير أو إضافي

    } else if (finalStatus === AttendanceEnum.Precent) {
      // ✅ لو "حاضر" → لازم checkIn على الأقل
      if (!createAttendanceDto.checkIn) {
        throw new BadRequestException('وقت الحضور مطلوب للموظف الحاضر');
      }

      // حساب التأخير
      lateHours = await this.attendanceCalculator.calculateLateHours(
        createAttendanceDto.employeeId,
        createAttendanceDto.checkIn,
      );

      // حساب الإضافي (إذا وُجد checkOut)
      if (createAttendanceDto.checkOut) {
        overtimeHours = await this.attendanceCalculator.calculateOvertimeHours(
          createAttendanceDto.employeeId,
          createAttendanceDto.checkOut,
        );
      }
    }

    // 5. حفظ السجل
    const attendance = await this.attendanceRepository.create({
      data: [
        {
          employeeId: new Types.ObjectId(createAttendanceDto.employeeId),
          date: date,
          checkIn: createAttendanceDto.checkIn,
          checkOut: createAttendanceDto.checkOut,
          lateHours: Number(lateHours.toFixed(2)),
          overtimeHours: Number(overtimeHours.toFixed(2)),
          status: finalStatus,
          notes: createAttendanceDto.notes,
        },
      ],
    });

    return {
      message: 'تم إضافة سجل الحضور بنجاح',
      data: attendance,
    };
  }

  /**
   * Find All Attendance Records - عرض كل سجلات الحضور
   */
  async findAll() {
    const records = await this.attendanceRepository.find({
      filter: {},
      options: {
        populate: {
          path: 'employeeId',
          select: 'fullName nationalId departmentId',
        },
        sort: { date: -1 },
      },
    });

    return {
      data: records,
      total: records.length,
    };
  }

  /**
   * Find One Attendance Record
   */
  async findOne(id: string) {
    const records = await this.attendanceRepository.find({
      filter: { _id: id },
      options: {
        populate: {
          path: 'employeeId',
          select: 'fullName nationalId',
          populate: { path: 'departmentId', select: 'name' },
        },
      },
    });

    if (!records || records.length === 0) {
      throw new NotFoundException('سجل الحضور غير موجود');
    }

    return {
      data: records[0],
    };
  }

  /**
   * Update Attendance Record - تعديل سجل الحضور
   * Validation Rule #4: Pop up for confirmation
   */
  async update(id: string, updateAttendanceDto: UpdateAttendanceDto) {
    const existing = await this.attendanceRepository.findOne({
      filter: { _id: id },
    });

    if (!existing) {
      throw new NotFoundException('سجل الحضور غير موجود');
    }

    // Recalculate late and overtime if times are updated
    let lateHours = existing.lateHours;
    let overtimeHours = existing.overtimeHours;

    if (updateAttendanceDto.checkIn) {
      lateHours = await this.attendanceCalculator.calculateLateHours(
        existing.employeeId.toString(),
        updateAttendanceDto.checkIn,
      );
    }

    if (updateAttendanceDto.checkOut) {
      overtimeHours = await this.attendanceCalculator.calculateOvertimeHours(
        existing.employeeId.toString(),
        updateAttendanceDto.checkOut,
      );
    }

    const updateData: any = {
      ...updateAttendanceDto,
      lateHours: Number(lateHours.toFixed(2)),
      overtimeHours: Number(overtimeHours.toFixed(2)),
    };

    if (updateAttendanceDto.date) {
      updateData.date = new Date(updateAttendanceDto.date);
    }

    if (updateAttendanceDto.employeeId) {
      updateData.employeeId = new Types.ObjectId(
        updateAttendanceDto.employeeId,
      );
    }

    const attendance = await this.attendanceRepository.findOneAndUpdate({
      filter: { _id: id },
      update: updateData,
    });

    return {
      message: 'تم تعديل سجل الحضور بنجاح',
      data: attendance,
    };
  }

  /**
   * Remove Attendance Record - حذف سجل الحضور
   * Validation Rule #5: Pop up for confirmation
   */
  async remove(id: string) {
    const attendance = await this.attendanceRepository.findOneAndDelete({
      filter: { _id: id },
    });

    if (!attendance) {
      throw new NotFoundException('سجل الحضور غير موجود');
    }

    return {
      message: 'تم حذف سجل الحضور بنجاح',
    };
  }

  /**
   * Search Attendance Records - البحث في سجلات الحضور
   * Validation Rules من PDF (نقطة 7)
   */
  async search(searchDto: SearchAttendanceDto) {
    const filter: any = {};

    // Validation Rule #1: Search by employee name
    if (searchDto.employeeName) {
      const employees = await this.employeeRepository.find({
        filter: { fullName: { $regex: searchDto.employeeName, $options: 'i' } },
      });

      if (employees.length === 0) {
        // Validation Rule #1: Invalid employee name
        throw new BadRequestException('من فضلك ادخل اسم موظف صالح');
      }

      const employeeIds = employees.map((emp) => emp._id);
      filter.employeeId = { $in: employeeIds };
    }

    // Search by specific employee ID
    if (searchDto.employeeId) {
      filter.employeeId = new Types.ObjectId(searchDto.employeeId);
    }

    // Search by department
    if (searchDto.departmentId) {
      const employees = await this.employeeRepository.find({
        filter: { departmentId: new Types.ObjectId(searchDto.departmentId) },
      });

      const employeeIds = employees.map((emp) => emp._id);
      filter.employeeId = { $in: employeeIds };
    }

    // Validation Rule #2: Date range validation
    if (searchDto.dateFrom && searchDto.dateTo) {
      const dateFrom = new Date(searchDto.dateFrom);
      const dateTo = new Date(searchDto.dateTo);

      if (dateFrom > dateTo) {
        throw new BadRequestException('من فضلك ادخل تاريخ صحيح');
      }

      filter.date = {
        $gte: dateFrom,
        $lte: dateTo,
      };
    } else if (searchDto.dateFrom) {
      filter.date = { $gte: new Date(searchDto.dateFrom) };
    } else if (searchDto.dateTo) {
      filter.date = { $lte: new Date(searchDto.dateTo) };
    }

    // Validation Rule #3: Required fields check
    if (
      !searchDto.employeeName &&
      !searchDto.employeeId &&
      !searchDto.departmentId &&
      !searchDto.dateFrom &&
      !searchDto.dateTo
    ) {
      throw new BadRequestException('هذه الحقول مطلوبة');
    }

    const records = await this.attendanceRepository.find({
      filter,
      options: {
        populate: [
          {
            path: 'employeeId',
            select: 'fullName nationalId',
            populate: { path: 'departmentId', select: 'name' },
          },
        ],
        sort: { date: -1 },
      },
    });

    return {
      data: records,
      total: records.length,
    };
  }

  /**
   * Import Attendance from Excel
   */
  async importFromExcel(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('من فضلك قم برفع ملف Excel');
    }

    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      // ✅ FIX: Define proper types
      const records: any[] = [];
      const errors: Array<{ row: number; error: string }> = [];

      for (let i = 0; i < data.length; i++) {
        const row: any = data[i];

        try {
          // Validate and create attendance record
          const employeeId =
            row.employeeId || row['Employee ID'] || row['معرف الموظف'];
          const date = row.date || row['Date'] || row['التاريخ'];
          const checkIn = row.checkIn || row['Check In'] || row['الحضور'];
          const checkOut = row.checkOut || row['Check Out'] || row['الانصراف'];

          if (!employeeId || !date) {
            errors.push({
              row: i + 2,
              error: 'معرف الموظف والتاريخ مطلوبان',
            });
            continue;
          }

          const attendance = await this.create({
            employeeId,
            date,
            checkIn,
            checkOut,
          });

          records.push(attendance.data);
        } catch (error) {
          errors.push({
            row: i + 2,
            error: error.message,
          });
        }
      }

      return {
        message: `تم استيراد ${records.length} سجل بنجاح`,
        data: {
          imported: records.length,
          errors: errors.length,
          errorDetails: errors,
        },
      };
    } catch (error) {
      throw new BadRequestException('فشل في قراءة ملف Excel: ' + error.message);
    }
  }

  /**
   * Export Attendance to Excel
   */
  async exportToExcel(searchDto: SearchAttendanceDto) {
    const result = await this.search(searchDto);
    const records = result.data;

    const data = records.map((record: any) => ({
      'اسم الموظف': record.employeeId?.fullName || '',
      'الرقم القومي': record.employeeId?.nationalId || '',
      القسم: record.employeeId?.departmentId?.name || '',
      التاريخ: new Date(record.date).toLocaleDateString('ar-EG'),
      'وقت الحضور': record.checkIn || '',
      'وقت الانصراف': record.checkOut || '',
      'ساعات التأخير': record.lateHours || 0,
      'ساعات الإضافي': record.overtimeHours || 0,
      الحالة: record.status || '',
      ملاحظات: record.notes || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return buffer;
  }

  /**
   * Get Attendance Statistics
   */
  async getStatistics(employeeId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const records = await this.attendanceRepository.find({
      filter: {
        employeeId: new Types.ObjectId(employeeId),
        date: { $gte: startDate, $lte: endDate },
      },
    });

    // ✅ FIX: Type assertion
    const typedRecords = records as any[];

    const stats = {
      totalDays: typedRecords.length,
      presentDays: typedRecords.filter(
        (r) => r.status === AttendanceEnum.Precent,
      ).length,
      absentDays: typedRecords.filter((r) => r.status === AttendanceEnum.Abcent)
        .length,
      holidays: typedRecords.filter((r) => r.status === AttendanceEnum.Holiday)
        .length,
      totalLateHours: typedRecords.reduce(
        (sum, r) => sum + (r.lateHours || 0),
        0,
      ),
      totalOvertimeHours: typedRecords.reduce(
        (sum, r) => sum + (r.overtimeHours || 0),
        0,
      ),
    };

    return {
      data: stats,
    };
  }
}
