import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { SettingsEnum } from 'src/common';

export class CreateSettingDto {
  @IsString()
  @IsNotEmpty({ message: 'من فضلك ادخل مفتاح الإعداد' })
  key: string;

  @IsNotEmpty({ message: 'من فضلك ادخل قيمة الإعداد' })
  value: any;

  @IsEnum(SettingsEnum, { message: 'نوع البيانات غير صالح' })
  @IsNotEmpty()
  dataType: SettingsEnum;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  userId?: string;
}