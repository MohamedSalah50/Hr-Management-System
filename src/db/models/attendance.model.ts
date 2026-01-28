import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AttendanceEnum, IAttendance } from 'src/common';

@Schema({
  timestamps: true,
  strict: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Attendance implements IAttendance {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ type: String, required: false, default: null })
  checkIn?: string;

  @Prop({ type: String, required: false, default: null })
  checkOut?: string;

  @Prop({ default: 0, type: Number })
  overtimeHours: number;

  @Prop({ default: 0, type: Number })
  lateHours: number;

  @Prop({
    required: true,
    enum: AttendanceEnum,
    default: AttendanceEnum.Precent,
  })
  status: AttendanceEnum;

  @Prop()
  notes: string;

  @Prop({ required: false, default: false })
  freezedAt: boolean;
}

export type AttendanceDocument = HydratedDocument<Attendance>;

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);

AttendanceSchema.pre(['findOne', 'find'], function (next) {
  const query = this.getQuery();

  if (query.paranoid === false) {
    this.setQuery({ ...query })
  } else {
    this.setQuery({ ...query, freezedAt: { $exists: false } })

  }
  next();
})

AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export const AttendanceModel = MongooseModule.forFeature([
  {
    name: Attendance.name,
    schema: AttendanceSchema,
  },
]);
