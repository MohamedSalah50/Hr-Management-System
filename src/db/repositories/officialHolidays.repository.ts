import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DatabaseRepository } from './database.repository';
import {
  OfficialHolidayDocument as TDocument,
  OfficialHoliday,
} from '../models';

@Injectable()
export class OfficialHolidayRepository extends DatabaseRepository<OfficialHoliday> {
  constructor(
    @InjectModel(OfficialHoliday.name)
    protected override readonly model: Model<TDocument>,
  ) {
    super(model);
  }
}
