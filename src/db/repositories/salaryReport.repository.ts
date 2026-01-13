import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DatabaseRepository } from './database.repository';
import { SalaryReportDocument as TDocument, SalaryReport } from '../models';

@Injectable()
export class SalaryReportRepository extends DatabaseRepository<SalaryReport> {
  constructor(
    @InjectModel(SalaryReport.name)
    protected override readonly model: Model<TDocument>,
  ) {
    super(model);
  }
}
