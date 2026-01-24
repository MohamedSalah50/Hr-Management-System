import {
  IsMongoId,
  IsDateString,
  IsString,
  IsOptional,
  IsEnum,
  Matches,
  IsNotEmpty,
  ValidateIf,
} from 'class-validator';
import { AttendanceEnum, IAttendance } from 'src/common';

export class CreateAttendanceDto{
  @IsMongoId({ message: 'معرف الموظف غير صالح' })
  @IsNotEmpty({ message: 'معرف الموظف مطلوب' })
  employeeId: string;

  @IsDateString({}, { message: 'من فضلك ادخل تاريخ صحيح' })
  @IsNotEmpty({ message: 'التاريخ مطلوب' })
  date: string;

  // ✅ checkIn اختياري، لكن إذا status = "present" لازم يكون موجود
  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.status === AttendanceEnum.Precent)
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'صيغة وقت الحضور غير صحيحة (HH:mm)',
  })
  checkIn?: string;

  // ✅ checkOut اختياري
  @IsString()
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'صيغة وقت الانصراف غير صحيحة (HH:mm)',
  })
  checkOut?: string;

  @IsEnum(AttendanceEnum, { message: 'حالة الحضور غير صالحة' })
  @IsOptional()
  status?: AttendanceEnum;

  @IsString()
  @IsOptional()
  notes?: string;
}