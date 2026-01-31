import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { GenderEnum, IEmployee } from 'src/common';

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

  @Prop({ required: true, enum: GenderEnum, default: GenderEnum.male })
  gender: GenderEnum;

  @Prop({ required: true })
  nationality: string;

  @Prop({ required: true, type: Date })
  contractDate: Date;

  @Prop({ required: true, type: Number })
  baseSalary: number;

  @Prop({ required: true })
  checkInTime: string;

  @Prop({ required: true })
  checkOutTime: string;

  @Prop({ type: Types.ObjectId, ref: 'Department' })
  departmentId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: false })
  freezedAt?: boolean;
}

export type EmployeeDocument = HydratedDocument<Employee>;

export const EmployeeSchema = SchemaFactory.createForClass(Employee);

EmployeeSchema.pre(['findOne', 'find'], function (next) {
  const query = this.getQuery();

  if (query.paranoid === false) {
    this.setQuery({ ...query })
  } else {
    this.setQuery({ ...query, freezedAt: { $exists: false } })

  }
  next();
})

EmployeeSchema.index({ nationalId: 1, departmentId: 1 });

export const EmployeeModel = MongooseModule.forFeature([
  {
    name: Employee.name,
    schema: EmployeeSchema,
  },
]);
