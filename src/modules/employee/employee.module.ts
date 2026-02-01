import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { DepartmentModel, DepartmentRepository, EmployeeModel, EmployeeRepository, UserModel, UserRepository } from 'src/db';
import { PermissionCheckerHelper } from 'src/common';

@Module({
  imports: [EmployeeModel, DepartmentModel, UserModel],
  controllers: [EmployeeController],
  providers: [EmployeeService, EmployeeRepository, DepartmentRepository, UserRepository],
})
export class EmployeeModule { }
