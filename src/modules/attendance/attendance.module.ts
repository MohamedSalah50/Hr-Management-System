import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import {
  AttendanceModel,
  AttendanceRepository,
  EmployeeModel,
  EmployeeRepository,
  OfficialHolidayModel,
  OfficialHolidayRepository,
  SettingModel,
  SettingRepository,
} from 'src/db';
import { AttendanceCalculatorHelper } from './helpers/attendance-calculator.helper';

@Module({
  imports: [AttendanceModel, EmployeeModel, OfficialHolidayModel,SettingModel],
  controllers: [AttendanceController],
  providers: [
    AttendanceService,
    AttendanceRepository,
    EmployeeRepository,
    OfficialHolidayRepository,
    SettingRepository,
    AttendanceCalculatorHelper,
  ],
})
export class AttendanceModule {}
