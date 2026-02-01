import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeDto } from './create-employee.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { containField } from 'src/common';

@containField()
export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}