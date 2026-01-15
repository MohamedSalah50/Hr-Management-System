import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateOfficialHolidayDto {
  @IsString()
  @IsNotEmpty({ message: 'من فضلك ادخل اسم الإجازة' })
  name: string;

  @IsDateString({}, { message: 'من فضلك ادخل تاريخ صحيح' })
  @IsNotEmpty({ message: 'من فضلك ادخل التاريخ' })
  date: string;

  @IsNumber({}, { message: 'من فضلك ادخل سنة صحيحة' })
  @IsNotEmpty({ message: 'من فضلك ادخل السنة' })
  @Min(2008, { message: 'السنة يجب ألا تقل عن 2008' })
  @Transform(({ value }) => Number(value))
  year: number;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;
}