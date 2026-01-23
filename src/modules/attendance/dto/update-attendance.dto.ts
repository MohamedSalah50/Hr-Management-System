import { PartialType } from '@nestjs/mapped-types';
import { CreateAttendanceDto } from './create-attendance.dto';
import { containField } from 'src/common';

@containField()
export class UpdateAttendanceDto extends PartialType(CreateAttendanceDto) {}
