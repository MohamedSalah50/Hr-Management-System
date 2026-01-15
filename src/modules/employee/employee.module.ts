import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { DepartmentModel, DepartmentRepository, EmployeeModel, EmployeeRepository } from 'src/db';

@Module({
  imports: [EmployeeModel, DepartmentModel],
  controllers: [EmployeeController],
  providers: [EmployeeService, EmployeeRepository, DepartmentRepository],
})
export class EmployeeModule { }
