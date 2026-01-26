// overtime-deduction-settings.dto.ts
import { IsNumber, IsNotEmpty, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class OvertimeDeductionSettingsDto {
  @IsNumber({}, { message: 'من فضلك ادخل قيمة صحيحة' })
  @IsNotEmpty({ message: 'من فضلك ادخال بيانات الحقل' })
  @Min(0, { message: 'القيمة يجب أن تكون أكبر من أو تساوي صفر' })
  @Transform(({ value }) => Number(value))
  overtimeHoursMultiplier: number; // مثلاً 1.5 يعني كل ساعة إضافي = 1.5 ساعة من الراتب

  @IsNumber({}, { message: 'من فضلك ادخل قيمة صحيحة' })
  @IsNotEmpty({ message: 'من فضلك ادخال بيانات الحقل' })
  @Min(0, { message: 'القيمة يجب أن تكون أكبر من أو تساوي صفر' })
  @Transform(({ value }) => Number(value))
  deductionHoursMultiplier: number; // مثلاً 2 يعني كل ساعة تأخير = خصم ساعتين من الراتب

  @IsNumber({}, { message: 'من فضلك ادخل قيمة صحيحة' })
  @IsNotEmpty({ message: 'من فضلك ادخال بيانات الحقل' })
  @Min(1, { message: 'عدد ساعات العمل يجب أن يكون أكبر من صفر' })
  @Transform(({ value }) => Number(value))
  workingHoursPerDay: number; // عدد ساعات العمل في اليوم (مثلاً 8)
}