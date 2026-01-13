import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DatabaseRepository } from './database.repository';
import { SettingDocument as TDocument, Setting } from '../models';

@Injectable()
export class SettingRepository extends DatabaseRepository<Setting> {
  constructor(
    @InjectModel(Setting.name)
    protected override readonly model: Model<TDocument>,
  ) {
    super(model);
  }
}
