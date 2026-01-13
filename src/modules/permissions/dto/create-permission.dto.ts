import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty({ message: 'اسم الصلاحية مطلوب' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'المورد (Resource) مطلوب' })
  resource: string;

  @IsString()
  @IsNotEmpty({ message: 'الإجراء (Action) مطلوب' })
  action: string;

  @IsString()
  @IsOptional()
  description?: string;
}
