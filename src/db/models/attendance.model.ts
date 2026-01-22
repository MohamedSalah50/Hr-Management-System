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

  @Prop()
  checkIn: string; // format: "09:15"

  @Prop()
  checkOut: string; // format: "17:30"

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
}

export type AttendanceDocument = HydratedDocument<Attendance>;

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);

AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export const AttendanceModel = MongooseModule.forFeature([
  {
    name: Attendance.name,
    schema: AttendanceSchema,
  },
]);
