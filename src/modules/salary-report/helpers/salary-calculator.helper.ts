// salary-calculator.helper.ts
import { Injectable } from '@nestjs/common';
import {
  SettingRepository,
  EmployeeRepository,
  AttendanceRepository,
} from 'src/db';
import { Types } from 'mongoose';
import { AttendanceEnum } from 'src/common';

@Injectable()
export class SalaryCalculatorHelper {
  constructor(
    private readonly settingRepository: SettingRepository,
    private readonly employeeRepository: EmployeeRepository,
    private readonly attendanceRepository: AttendanceRepository,
  ) {}

  async getWorkingDaysInMonth(month: number, year: number): Promise<number> {
    const daysInMonth = new Date(year, month, 0).getDate();
    const weekendSetting = await this.settingRepository.findOne({
      filter: { key: 'weekend_days' },
    });

    const weekendDays: string[] = weekendSetting?.value || [
      'Friday',
      'Saturday',
    ];
    let workingDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

      if (!weekendDays.includes(dayName)) {
        workingDays++;
      }
    }

    return workingDays;
  }

  async getAttendanceStats(employeeId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const records = await this.attendanceRepository.find({
      filter: {
        employeeId: new Types.ObjectId(employeeId),
        date: { $gte: startDate, $lte: endDate },
      },
    });

    const typedRecords = records as any[];

    const stats = {
      daysPresent: typedRecords.filter(
        (r) => r.status === AttendanceEnum.Precent,
      ).length,
      daysAbsent: typedRecords.filter((r) => r.status === AttendanceEnum.Abcent)
        .length,
      holidays: typedRecords.filter((r) => r.status === AttendanceEnum.Holiday)
        .length,
      sickLeave: typedRecords.filter(
        (r) => r.status === AttendanceEnum.Sick_leave,
      ).length,
      overtimeHours: typedRecords.reduce(
        (sum, r) => sum + (r.overtimeHours || 0),
        0,
      ),
      lateHours: typedRecords.reduce((sum, r) => sum + (r.lateHours || 0), 0),
    };

    return stats;
  }

  /**
   * Calculate overtime amount based on hours multiplier
   * Formula: overtimeAmount = (baseSalary / (workingDays * hoursPerDay)) * overtimeHours * multiplier
   */
  async calculateOvertimeAmount(
    baseSalary: number,
    overtimeHours: number,
    workingDays: number,
  ): Promise<number> {
    // Get settings
    const overtimeMultiplierSetting = await this.settingRepository.findOne({
      filter: { key: 'overtime_hours_multiplier' },
    });
    const workingHoursPerDaySetting = await this.settingRepository.findOne({
      filter: { key: 'working_hours_per_day' },
    });

    const overtimeMultiplier = overtimeMultiplierSetting?.value || 1.5; // Default 1.5
    const hoursPerDay = workingHoursPerDaySetting?.value || 8; // Default 8 hours

    // Calculate hourly rate
    const hourlyRate = baseSalary / (workingDays * hoursPerDay);

    // Calculate overtime amount
    const overtimeAmount = hourlyRate * overtimeHours * overtimeMultiplier;

    console.log('🧮 Overtime Calculation:', {
      baseSalary,
      workingDays,
      hoursPerDay,
      overtimeHours,
      overtimeMultiplier,
      hourlyRate: hourlyRate.toFixed(2),
      overtimeAmount: overtimeAmount.toFixed(2),
    });

    return Number(overtimeAmount.toFixed(2));
  }

  /**
   * Calculate deduction amount based on hours multiplier
   * Formula: deductionAmount = (baseSalary / (workingDays * hoursPerDay)) * lateHours * multiplier
   */
  async calculateDeductionAmount(
    baseSalary: number,
    lateHours: number,
    workingDays: number,
  ): Promise<number> {
    // Get settings
    const deductionMultiplierSetting = await this.settingRepository.findOne({
      filter: { key: 'deduction_hours_multiplier' },
    });
    const workingHoursPerDaySetting = await this.settingRepository.findOne({
      filter: { key: 'working_hours_per_day' },
    });

    const deductionMultiplier = deductionMultiplierSetting?.value || 2; // Default 2
    const hoursPerDay = workingHoursPerDaySetting?.value || 8; // Default 8 hours

    // Calculate hourly rate
    const hourlyRate = baseSalary / (workingDays * hoursPerDay);

    // Calculate deduction amount
    const deductionAmount = hourlyRate * lateHours * deductionMultiplier;

    return Number(deductionAmount.toFixed(2));
  }

  /**
   * Calculate net salary
   */
  async calculateNetSalary(
    baseSalary: number,
    overtimeAmount: number,
    deductionAmount: number,
    daysPresent: number,
    daysAbsent: number,
    workingDays: number,
    holidays: number,
    sickLeave: number,
  ): Promise<number> {
    // 1. Calculate daily salary
    const dailySalary = baseSalary / workingDays;

    // 2. Calculate absence penalty
    const absentPenalty = dailySalary * daysAbsent;

    // 3. Calculate net salary
    const netSalary =
      baseSalary + overtimeAmount - deductionAmount - absentPenalty;

    return Number(Math.max(0, netSalary).toFixed(2));
  }
}
