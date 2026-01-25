import { IsOptional, IsDateString, IsMongoId, IsString } from 'class-validator';

export class SearchAttendanceDto {
  @IsOptional()
  @IsMongoId({ message: 'معرف الموظف غير صالح' })
  employeeId?: string;

  @IsOptional()
  @IsString()
  employeeName?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;
}
