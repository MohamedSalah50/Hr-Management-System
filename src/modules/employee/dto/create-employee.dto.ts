import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsDateString,
  IsNumber,
  IsMongoId,
  Length,
  Matches,
  Min,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { GenderEnum } from 'src/common';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty({ message: 'هذا الحقل مطلوب' })
  fullName: string;

  @IsString()
  @IsNotEmpty({ message: 'هذا الحقل مطلوب' })
  @Length(14, 14, { message: 'يجب الا يقل الرقم القومي عن 14 رقم !' })
  @Matches(/^[0-9]+$/, { message: 'الرقم القومي يجب أن يحتوي على أرقام فقط' })
  nationalId: string;

  @IsString()
  @IsNotEmpty({ message: 'هذا الحقل مطلوب' })
  @Length(11, 11, { message: 'من فضلك ادخل رقم تليفون صحيح' })
  @Matches(/^[0-9]+$/, { message: 'من فضلك ادخل رقم تليفون صحيح' })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: 'هذا الحقل مطلوب' })
  address: string;

  @IsDateString({}, { message: 'من فضلك ادخل تاريخ الميلاد الصحيح' })
  @IsNotEmpty({ message: 'هذا الحقل مطلوب' })
  // @Transform(({ value }) => {
  //   const date = new Date(value);
  //   const age = new Date().getFullYear() - date.getFullYear();
    // if (age < 20) {
    //   throw new Error('يجب الا يقل عمر الموظف عن 20 سنة');
    // }
    // return value;
  // })
  birthDate: string;

  @IsEnum(GenderEnum, { message: 'من فضلك اختر النوع' })
  @IsNotEmpty({ message: 'هذا الحقل مطلوب' })
  gender: GenderEnum;

  @IsString()
  @IsNotEmpty({ message: 'هذا الحقل مطلوب' })
  nationality: string;

  @IsDateString({}, { message: 'من فضلك ادخل تاريخ تعاقد صحيح' })
  @IsNotEmpty({ message: 'هذا الحقل مطلوب' })
  @Transform(({ value }) => {
    const contractDate = new Date(value);
    const companyStartDate = new Date('2008-01-01');
    if (contractDate < companyStartDate) {
      throw new Error('من فضلك ادخل تاريخ تعاقد صحيح');
    }
    return value;
  })
  contractDate: string;

  @IsNumber({}, { message: 'من فضلك ادخل راتب صحيح' })
  @IsNotEmpty({ message: 'هذا الحقل مطلوب' })
  @Min(0, { message: 'من فضلك ادخل راتب صحيح' })
  @Transform(({ value }) => Number(value))
  baseSalary: number;

  @IsString()
  @IsNotEmpty({ message: 'هذا الحقل مطلوب' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'صيغة الوقت غير صحيحة (HH:mm)',
  })
  checkInTime: string;

  @IsString()
  @IsNotEmpty({ message: 'هذا الحقل مطلوب' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'صيغة الوقت غير صحيحة (HH:mm)',
  })
  checkOutTime: string;

  @IsMongoId({ message: 'معرف القسم غير صالح' })
  @IsNotEmpty({ message: 'هذا الحقل مطلوب' })
  departmentId: string;
}