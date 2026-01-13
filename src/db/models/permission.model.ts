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
  resource: string; // employees, attendance, reports, etc.

  @Prop({ required: true })
  action: string; // create, read, update, delete

  @Prop({ required: false, minlength: 15, maxlength: 500 })
  description: string;
}

export type PermissionDocument = HydratedDocument<Permission>;

export const PermissionSchema = SchemaFactory.createForClass(Permission);

export const PermissionModel = MongooseModule.forFeature([
  {
    name: Permission.name,
    schema: PermissionSchema,
  },
]);
