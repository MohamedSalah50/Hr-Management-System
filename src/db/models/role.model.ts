import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { IRole } from 'src/common';

@Schema({
  timestamps: true,
  strict: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Role implements IRole {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ minlength: 15, maxlength: 500, required: false })
  description: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Permission' }], default: [] })
  permissions?: Types.ObjectId[];

  @Prop({ required: false, default: false })
  freezedAt: boolean;
}

export type RoleDocument = HydratedDocument<Role>;

export const RoleSchema = SchemaFactory.createForClass(Role);

RoleSchema.pre(['findOne', 'find'], function (next) {
  const query = this.getQuery();

  if (query.paranoid === false) {
    this.setQuery({ ...query })
  } else {
    this.setQuery({ ...query, freezedAt: { $exists: false } })

  }
  next();
})

export const RoleModel = MongooseModule.forFeature([
  {
    name: Role.name,
    schema: RoleSchema,
  },
]);
