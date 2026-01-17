import { IsArray, ArrayNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAttendanceDto } from './create-attendance.dto';

export class ImportAttendanceDto {
  @IsArray()
  @ArrayNotEmpty({ message: 'البيانات المستوردة فارغة' })
  @ValidateNested({ each: true })
  @Type(() => CreateAttendanceDto)
  records: CreateAttendanceDto[];
}
