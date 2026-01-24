import { Injectable } from '@nestjs/common';
import { SettingRepository, EmployeeRepository, AttendanceRepository } from 'src/db';
import { Types } from 'mongoose';
import { AttendanceEnum } from 'src/common';

@Injectable()
export class SalaryCalculatorHelper {
    constructor(
        private readonly settingRepository: SettingRepository,
        private readonly employeeRepository: EmployeeRepository,
        private readonly attendanceRepository: AttendanceRepository,
    ) { }

    /**
     * Get working days in month (excluding weekends)
     */
    async getWorkingDaysInMonth(month: number, year: number): Promise<number> {
        const daysInMonth = new Date(year, month, 0).getDate();
        const weekendSetting = await this.settingRepository.findOne({
            filter: { key: 'weekend_days' },
        });

        const weekendDays: string[] = weekendSetting?.value || ['Friday', 'Saturday'];
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

    /**
     * Get attendance statistics for employee in a month
     */
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
            // ✅ أيام الحضور
            daysPresent: typedRecords.filter(
                (r) => r.status === AttendanceEnum.Precent
            ).length,

            // ✅ أيام الغياب (فقط اللي هيتخصم)
            daysAbsent: typedRecords.filter(
                (r) => r.status === AttendanceEnum.Abcent
            ).length,

            // ✅ الإجازات الرسمية (مش هيتخصم)
            holidays: typedRecords.filter(
                (r) => r.status === AttendanceEnum.Holiday
            ).length,

            // ✅ الإجازات المرضية (مش هيتخصم)
            sickLeave: typedRecords.filter(
                (r) => r.status === AttendanceEnum.Sick_leave
            ).length,

            // مجموع ساعات الإضافي
            overtimeHours: typedRecords.reduce(
                (sum, r) => sum + (r.overtimeHours || 0),
                0
            ),

            // مجموع ساعات التأخير
            lateHours: typedRecords.reduce(
                (sum, r) => sum + (r.lateHours || 0),
                0
            ),
        };

        return stats;
    }

    /**
     * Calculate overtime amount
     */
    async calculateOvertimeAmount(overtimeHours: number): Promise<number> {
        const overtimeRateSetting = await this.settingRepository.findOne({
            filter: { key: 'overtime_rate_per_hour' },
        });

        const overtimeRate = overtimeRateSetting?.value || 50;
        return Number((overtimeHours * overtimeRate).toFixed(2));
    }

    /**
     * Calculate deduction amount
     */
    async calculateDeductionAmount(lateHours: number): Promise<number> {
        const deductionRateSetting = await this.settingRepository.findOne({
            filter: { key: 'deduction_rate_per_hour' },
        });

        const deductionRate = deductionRateSetting?.value || 30;
        return Number((lateHours * deductionRate).toFixed(2));
    }

    /**
     * Calculate net salary
     * NOTE: This is a BASIC calculation pending business logic clarification
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
        // 1. حساب الراتب اليومي
        const dailySalary = baseSalary / workingDays;

        // 2. حساب عقوبة الغياب
        // ✅ فقط daysAbsent يُخصم، holidays و sickLeave لا يُخصموا
        const absentPenalty = dailySalary * daysAbsent;

        // 3. حساب صافي الراتب
        const netSalary = baseSalary + overtimeAmount - deductionAmount - absentPenalty;

        return Number(Math.max(0, netSalary).toFixed(2));
    }
}