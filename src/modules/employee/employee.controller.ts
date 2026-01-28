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
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Types } from 'mongoose';
import { auth } from 'src/common/decorators/auth.decorator';
import { RoleEnum } from 'src/common';

@auth([RoleEnum.admin, RoleEnum.superAdmin])
@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.create(createEmployeeDto);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    if (search) {
      return this.employeeService.search(search);
    }
    if (departmentId) {
      return this.employeeService.getByDepartment(departmentId);
    }
    return this.employeeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeeService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: Types.ObjectId,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeeService.update(id, updateEmployeeDto);
  }

  @Patch(':id')
  remove(@Param('id') id: string) {
    return this.employeeService.softDelete(id);
  }

  @Patch(':id/toggle-status')
  toggleStatus(@Param('id') id: Types.ObjectId) {
    return this.employeeService.toggleStatus(id);
  }
}
