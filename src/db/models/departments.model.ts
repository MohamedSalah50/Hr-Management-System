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
}

export type DepartmentDocument = HydratedDocument<Department>;

export const DepartmentSchema = SchemaFactory.createForClass(Department);

export const DepartmentModel = MongooseModule.forFeature([
  {
    name: Department.name,
    schema: DepartmentSchema,
  },
]);
