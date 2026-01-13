import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  IsOptional,
  IsMongoId,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty({ message: 'من فضلك ادخل اسم المجموعة' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray({ message: 'الصلاحيات يجب أن تكون مصفوفة' })
  @ArrayMinSize(1, { message: 'من فضلك قم بتحديد صلاحيات المجموعة قبل الاضافة' })
  @IsMongoId({ each: true, message: 'معرف الصلاحية غير صالح' })
  permissions: string[];
}