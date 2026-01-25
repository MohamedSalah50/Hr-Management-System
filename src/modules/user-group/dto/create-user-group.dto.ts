import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { Types } from 'mongoose';
import { IUserGroup } from 'src/common';

export class CreateUserGroupDto implements IUserGroup {
  @IsString({ message: 'اسم المجموعة يجب أن يكون نص' })
  @IsNotEmpty({ message: 'من فضلك ادخل اسم المجموعة' })
  name: string;

  @IsString({ message: 'الوصف يجب أن يكون نص' })
  @IsOptional()
  description?: string;

  @IsArray({ message: 'الصلاحيات يجب أن تكون قائمة' })
  @ArrayMinSize(1, {
    message: 'من فضلك قم بتحديد صلاحيات المجموعة قبل الاضافة',
  })
  permissions: Types.ObjectId[];

  @IsArray({ message: 'المستخدمين يجب أن تكون قائمة' })
  @IsOptional()
  userIds: Types.ObjectId[];
}
