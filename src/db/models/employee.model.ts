import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { IEmployee } from 'src/common';

@Schema({
  timestamps: true,
  strict: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Employee implements IEmployee {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true, length: 14 })
  nationalId: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  address: string;

  @Prop({ required: true, type: Date })
  birthDate: Date;

  @Prop({ required: true, enum: ['male', 'female'] })
  gender: string;

  @Prop({ required: true })
  nationality: string;

  @Prop({ required: true, type: Date })
  contractDate: Date;

  @Prop({ required: true, type: Number })
  baseSalary: number;

  @Prop({ required: true })
  checkInTime: string; // format: "09:00"

  @Prop({ required: true })
  checkOutTime: string; // format: "17:00"

  @Prop({ type: Types.ObjectId, ref: 'Department' })
  departmentId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
}

export type EmployeeDocument = HydratedDocument<Employee>;

export const EmployeeSchema = SchemaFactory.createForClass(Employee);

export const EmployeeModel = MongooseModule.forFeature([
  {
    name: Employee.name,
    schema: EmployeeSchema,
  },
]);
