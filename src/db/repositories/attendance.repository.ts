import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DatabaseRepository } from './database.repository';
import { AttendanceDocument as TDocument, Attendance } from '../models';

@Injectable()
export class AttendanceRepository extends DatabaseRepository<Attendance> {
  constructor(
    @InjectModel(Attendance.name)
    protected override readonly model: Model<TDocument>,
  ) {
    super(model);
  }
}
