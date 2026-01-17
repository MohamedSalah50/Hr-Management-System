import { Module } from '@nestjs/common';
import { SalaryReportService } from './salary-report.service';
import { SalaryReportController } from './salary-report.controller';
import { SalaryCalculatorHelper } from './helpers/salary-calculator.helper';
import { EmployeeModel, EmployeeRepository, SalaryReportModel, SalaryReportRepository } from 'src/db';

@Module({
  imports:[SalaryReportModel,EmployeeModel],
  controllers: [SalaryReportController],
  providers: [SalaryReportService,SalaryCalculatorHelper,EmployeeRepository,SalaryReportRepository],
})
export class SalaryReportModule {}
