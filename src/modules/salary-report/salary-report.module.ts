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
  UserModel,
  UserRepository,
} from 'src/db';

@Module({
  imports: [SalaryReportModel, EmployeeModel, SettingModel, AttendanceModel, UserModel],
  controllers: [SalaryReportController],
  providers: [
    SalaryReportService,
    SalaryCalculatorHelper,
    EmployeeRepository,
    SalaryReportRepository,
    SettingRepository,
    AttendanceRepository,
    UserRepository
  ],
})
export class SalaryReportModule { }
