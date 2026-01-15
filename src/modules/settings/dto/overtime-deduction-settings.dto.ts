import { IsNumber, IsNotEmpty, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class OvertimeDeductionSettingsDto {
  @IsNumber({}, { message: 'من فضلك ادخل قيمة صحيحة' })
  @IsNotEmpty({ message: 'من فضلك ادخال بيانات الحقل' })
  @Min(0, { message: 'القيمة يجب أن تكون أكبر من أو تساوي صفر' })
  @Transform(({ value }) => Number(value))
  overtimeRatePerHour: number;

  @IsNumber({}, { message: 'من فضلك ادخل قيمة صحيحة' })
  @IsNotEmpty({ message: 'من فضلك ادخال بيانات الحقل' })
  @Min(0, { message: 'القيمة يجب أن تكون أكبر من أو تساوي صفر' })
  @Transform(({ value }) => Number(value))
  deductionRatePerHour: number;
}