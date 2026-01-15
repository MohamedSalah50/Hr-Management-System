import { PartialType } from '@nestjs/mapped-types';
import { CreatePermissionDto } from './create-permission.dto';
import { containField } from 'src/common';


@containField()
export class UpdatePermissionDto extends PartialType(CreatePermissionDto) { }
