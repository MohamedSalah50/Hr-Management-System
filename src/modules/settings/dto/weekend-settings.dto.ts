import { IsArray, ArrayNotEmpty, IsIn } from 'class-validator';

const DAYS_OF_WEEK = [
  'Friday',
  'Saturday',
];

export class WeekendSettingsDto {
  @IsArray({ message: 'أيام الإجازة يجب أن تكون مصفوفة' })
  @ArrayNotEmpty({ message: 'من فضلك ادخال بيانات الحقل' })
  @IsIn(DAYS_OF_WEEK, {
    each: true,
    message: 'يوم غير صالح , يجب ان يكون من ' + DAYS_OF_WEEK.join(', '),
  })
  weekendDays: string[];
}