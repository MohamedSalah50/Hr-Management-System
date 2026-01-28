import { Types } from "mongoose"

export interface ISalaryReport {
    employeeId: Types.ObjectId;
    month: number;
    year: number;
    baseSalary: number;
    daysPresent: number;
    daysAbsent: number;
    holidays: number;
    sickLeave: number;
    overtimeHours: number;
    lateHours: number;
    overtimeAmount: number;
    deductionAmount: number;
    netSalary: number;
    freezedAt?: boolean;

}