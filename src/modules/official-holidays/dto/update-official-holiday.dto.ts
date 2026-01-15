import { PartialType } from '@nestjs/mapped-types';
import { CreateOfficialHolidayDto } from './create-official-holiday.dto';

export class UpdateOfficialHolidayDto extends PartialType(CreateOfficialHolidayDto) { }