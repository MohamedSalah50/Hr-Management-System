import { Types } from 'mongoose';
import { AttendanceEnum } from '../enums';

export interface IAttendance {
  employeeId: Types.ObjectId;
  date: Date;
  checkIn: string;
  checkOut: string;
  overtimeHours: number;
  lateHours: number;
  status: AttendanceEnum;
  notes: string;
}
