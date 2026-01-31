import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { IDepartment } from 'src/common';

@Schema({
  timestamps: true,
  strict: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Department implements IDepartment {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: false })
  freezedAt: boolean;
}

export type DepartmentDocument = HydratedDocument<Department>;

export const DepartmentSchema = SchemaFactory.createForClass(Department);

DepartmentSchema.pre(['findOne', 'find'], function (next) {
  const query = this.getQuery();

  if (query.paranoid === false) {
    this.setQuery({ ...query });
  } else {
    this.setQuery({ ...query, freezedAt: { $exists: false } });
  }
  next();
});

export const DepartmentModel = MongooseModule.forFeature([
  {
    name: Department.name,
    schema: DepartmentSchema,
  },
]);
