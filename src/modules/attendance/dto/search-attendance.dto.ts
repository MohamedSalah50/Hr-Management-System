import { IsOptional, IsDateString, IsMongoId, IsString } from 'class-validator';

export class SearchAttendanceDto {
    @IsOptional()
    @IsMongoId({ message: 'معرف الموظف غير صالح' })
    employeeId?: string;

    @IsOptional()
    @IsMongoId({ message: 'معرف القسم غير صالح' })
    departmentId?: string;

    @IsOptional()
    @IsDateString({}, { message: 'من فضلك ادخل تاريخ صحيح' })
    dateFrom?: string;

    @IsOptional()
    @IsDateString({}, { message: 'من فضلك ادخل تاريخ صحيح' })
    dateTo?: string;

    @IsOptional()
    @IsString()
    employeeName?: string;
}