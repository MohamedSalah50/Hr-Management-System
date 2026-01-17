import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { AttendanceModel, AttendanceRepository, EmployeeModel, EmployeeRepository, OfficialHolidayModel, OfficialHolidayRepository } from 'src/db';
import { AttendanceCalculatorHelper } from './helpers/attendance-calculator.helper';

@Module({
  imports: [EmployeeModel, OfficialHolidayModel, AttendanceModel],
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceRepository, AttendanceCalculatorHelper, OfficialHolidayRepository, EmployeeRepository],
})
export class AttendanceModule { }
