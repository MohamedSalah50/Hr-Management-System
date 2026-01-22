import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DatabaseRepository } from './database.repository';
import { UserGroup, UserGroupDocument as TDocument } from '../models';

@Injectable()
export class UserGroupRepository extends DatabaseRepository<UserGroup> {
  constructor(
    @InjectModel(UserGroup.name)
    protected override readonly model: Model<TDocument>,
  ) {
    super(model);
  }
}
