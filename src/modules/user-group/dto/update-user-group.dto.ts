import { PartialType } from '@nestjs/mapped-types';
import { CreateUserGroupDto } from './create-user-group.dto';
import { IsArray, IsOptional } from 'class-validator';
import { Types } from 'mongoose';
import { containField } from 'src/common';

@containField()
export class UpdateUserGroupDto extends PartialType(CreateUserGroupDto) {
}
