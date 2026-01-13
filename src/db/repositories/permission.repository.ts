import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DatabaseRepository } from './database.repository';
import { PermissionDocument as TDocument, Permission } from '../models';

@Injectable()
export class PermissionRepository extends DatabaseRepository<Permission> {
  constructor(
    @InjectModel(Permission.name)
    protected override readonly model: Model<TDocument>,
  ) {
    super(model);
  }
}
