import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DatabaseRepository } from './database.repository';
import { EmployeeDocument as TDocument, Employee } from '../models';

@Injectable()
export class EmployeeRepository extends DatabaseRepository<Employee> {
  constructor(
    @InjectModel(Employee.name)
    protected override readonly model: Model<TDocument>,
  ) {
    super(model);
  }
}
