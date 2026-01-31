import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ISalaryReport } from 'src/common';

@Schema({
  timestamps: true,
  strict: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class SalaryReport implements ISalaryReport {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 12 })
  month: number;

  @Prop({ required: true })
  year: number;

  @Prop({ required: true, type: Number })
  baseSalary: number;

  @Prop({ required: true, type: Number })
  daysPresent: number;

  @Prop({ required: true, type: Number })
  daysAbsent: number;

  @Prop({ default: 0, type: Number })
  holidays: number;

  @Prop({ default: 0, type: Number })
  sickLeave: number;

  @Prop({ required: true, type: Number })
  overtimeHours: number;

  @Prop({ required: true, type: Number })
  lateHours: number;

  @Prop({ required: true, type: Number })
  overtimeAmount: number;

  @Prop({ required: true, type: Number })
  deductionAmount: number;

  @Prop({ required: true, type: Number })
  netSalary: number;

  @Prop({ required: false })
  freezedAt: boolean;
}

export type SalaryReportDocument = HydratedDocument<SalaryReport>;

export const SalaryReportSchema = SchemaFactory.createForClass(SalaryReport);


SalaryReportSchema.pre(['findOne', 'find'], function (next) {
  const query = this.getQuery();

  if (query.paranoid === false) {
    this.setQuery({ ...query })
  } else {
    this.setQuery({ ...query, freezedAt: { $exists: false } })

  }
})


SalaryReportSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

export const SalaryReportModel = MongooseModule.forFeature([
  {
    name: SalaryReport.name,
    schema: SalaryReportSchema,
  },
]);
