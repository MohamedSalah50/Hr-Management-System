import { Injectable } from '@nestjs/common';
import { SettingRepository, EmployeeRepository } from 'src/db';

@Injectable()
export class AttendanceCalculatorHelper {
    constructor(
        private readonly settingRepository: SettingRepository,
        private readonly employeeRepository: EmployeeRepository) { }

    /**
     * Calculate time difference in hours
     */
    private calculateTimeDifference(time1: string, time2: string): number {
        const [h1, m1] = time1.split(':').map(Number);
        const [h2, m2] = time2.split(':').map(Number);

        const minutes1 = h1 * 60 + m1;
        const minutes2 = h2 * 60 + m2;

        return Math.abs(minutes2 - minutes1) / 60;
    }

    /**
     * Calculate late hours
     */
    async calculateLateHours(
        employeeId: string,
        checkIn: string,
    ): Promise<number> {
        const employee = await this.employeeRepository.findOne({ filter: { _id: employeeId } });

        if (!employee || !checkIn) return 0;

        const scheduledCheckIn = employee.checkInTime;
        const [schedH, schedM] = scheduledCheckIn.split(':').map(Number);
        const [actualH, actualM] = checkIn.split(':').map(Number);

        const scheduledMinutes = schedH * 60 + schedM;
        const actualMinutes = actualH * 60 + actualM;

        if (actualMinutes > scheduledMinutes) {
            return (actualMinutes - scheduledMinutes) / 60;
        }

        return 0;
    }

    /**
     * Calculate overtime hours
     */
    async calculateOvertimeHours(
        employeeId: string,
        checkOut: string,
    ): Promise<number> {
        const employee = await this.employeeRepository.findOne({ filter: { _id: employeeId } });

        if (!employee || !checkOut) return 0;

        const scheduledCheckOut = employee.checkOutTime;
        const [schedH, schedM] = scheduledCheckOut.split(':').map(Number);
        const [actualH, actualM] = checkOut.split(':').map(Number);

        const scheduledMinutes = schedH * 60 + schedM;
        const actualMinutes = actualH * 60 + actualM;

        if (actualMinutes > scheduledMinutes) {
            return (actualMinutes - scheduledMinutes) / 60;
        }

        return 0;
    }

    /**
     * Check if date is weekend
     */
    async isWeekend(date: Date): Promise<boolean> {
        const weekendSetting = await this.settingRepository.findOne({
            filter: { key: 'weekend_days' },
        });

        if (!weekendSetting) return false;

        const weekendDays: string[] = weekendSetting.value || [
            'Friday',
            'Saturday',
        ];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

        return weekendDays.includes(dayName);
    }
}
