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

@auth([RoleEnum.admin, RoleEnum.user])
@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) { }

  @Post()
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.create(createEmployeeDto);
  }

  @Get(":userId")
  findAll(
    @Param('userId') userId: Types.ObjectId,
    @Query('search') search?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    if (search) {
      return this.employeeService.search(search);
    }
    if (departmentId) {
      return this.employeeService.getByDepartment(departmentId);
    }
    return this.employeeService.findAll(userId);
  }

  @Get(':id/:userId')
  findOne(@Param('id') id: string, @Param('userId') userId: string) {
    return this.employeeService.findOne(id, userId);
  }

  @Patch(':id/:userId')
  update(
    @Param('userId') userId: Types.ObjectId,
    @Param('id') id: Types.ObjectId,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeeService.update(id, userId, updateEmployeeDto);
  }

  @Patch(':id/soft-delete/:userId')
  remove(@Param('id') id: string, @Param('userId') userId: Types.ObjectId) {
    return this.employeeService.softDelete(id, userId);
  }

  @Patch(':id/toggle-status')
  toggleStatus(@Param('id') id: Types.ObjectId) {
    return this.employeeService.toggleStatus(id);
  }
}
