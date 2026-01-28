import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Types } from 'mongoose';
import { auth } from 'src/common/decorators/auth.decorator';
import { RoleEnum } from 'src/common';

@auth([RoleEnum.admin, RoleEnum.superAdmin, RoleEnum.user])
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) { }

  @Post()
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  findAll(@Query('resource') resource?: string) {
    if (resource) {
      return this.permissionsService.findByResource(resource);
    }
    return this.permissionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: Types.ObjectId) {
    return this.permissionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: Types.ObjectId,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Patch(':id/soft-delete')
  remove(@Param('id') id: Types.ObjectId) {
    return this.permissionsService.softDelete(id);
  }
}
