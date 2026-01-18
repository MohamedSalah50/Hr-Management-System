import { Module } from '@nestjs/common';
import { SalaryReportService } from './salary-report.service';
import { SalaryReportController } from './salary-report.controller';
import { SalaryCalculatorHelper } from './helpers/salary-calculator.helper';
import {
  AttendanceModel,
  AttendanceRepository,
  EmployeeModel,
  EmployeeRepository,
  SalaryReportModel,
  SalaryReportRepository,
  SettingModel,
  SettingRepository,
} from 'src/db';

@Module({
  imports: [SalaryReportModel, EmployeeModel,SettingModel,AttendanceModel],
  controllers: [SalaryReportController],
  providers: [
    SalaryReportService,
    SalaryCalculatorHelper,
    EmployeeRepository,
    SalaryReportRepository,
    SettingRepository,
    AttendanceRepository
  ],
})
export class SalaryReportModule {}
