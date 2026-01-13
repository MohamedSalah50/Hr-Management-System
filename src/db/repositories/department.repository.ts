import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DatabaseRepository } from './database.repository';
import { DepartmentDocument as TDocument, Department } from '../models';

@Injectable()
export class DepartmentRepository extends DatabaseRepository<Department> {
  constructor(
    @InjectModel(Department.name)
    protected override readonly model: Model<TDocument>,
  ) {
    super(model);
  }
}
