// modules/salary-reports/dto/generate-report.dto.ts
import { IsNumber, IsNotEmpty, Min, Max, IsMongoId, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class GenerateReportDto {
  @IsMongoId({ message: 'معرف الموظف غير صالح' })
  @IsNotEmpty({ message: 'معرف الموظف مطلوب' }) // ✅ Make it required
  employeeId: string; // ✅ Remove the optional "?"

  @IsNumber({}, { message: 'من فضلك ادخل شهر صحيح' })
  @IsNotEmpty({ message: 'الشهر مطلوب' })
  @Min(1, { message: 'الشهر يجب أن يكون بين 1 و 12' })
  @Max(12, { message: 'الشهر يجب أن يكون بين 1 و 12' })
  @Transform(({ value }) => Number(value))
  month: number;

  @IsNumber({}, { message: 'من فضلك اختر سنة صحيحة' })
  @IsNotEmpty({ message: 'السنة مطلوبة' })
  @Min(2008, { message: 'من فضلك اختر سنة صحيحة' })
  @Transform(({ value }) => Number(value))
  year: number;
}