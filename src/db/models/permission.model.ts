import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { IPermission } from 'src/common';

@Schema({
  timestamps: true,
  strict: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Permission implements IPermission {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  resource: string;

  @Prop({ required: true })
  action: string;

  @Prop({ required: false, minlength: 15, maxlength: 500 })
  description: string;

  @Prop({ required: false, default: false })
  freezedAt: boolean;
}

export type PermissionDocument = HydratedDocument<Permission>;

export const PermissionSchema = SchemaFactory.createForClass(Permission);

PermissionSchema.pre(['findOne', 'find'], function (next) {
  const query = this.getQuery();

  if (query.paranoid === false) {
    this.setQuery({ ...query })
  } else {
    this.setQuery({ ...query, freezedAt: { $exists: false } })

  }
  next();
})

export const PermissionModel = MongooseModule.forFeature([
  {
    name: Permission.name,
    schema: PermissionSchema,
  },
]);
