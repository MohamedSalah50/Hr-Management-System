import { IsOptional, IsNumber, IsMongoId, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class SearchReportDto {
  @IsOptional()
  @IsMongoId({ message: 'معرف الموظف غير صالح' })
  employeeId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  @Transform(({ value }) => Number(value))
  month?: number;

  @IsOptional()
  @IsNumber()
  @Min(2008)
  @Transform(({ value }) => Number(value))
  year?: number;
}