import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { IOfficialHoliday } from 'src/common';

@Schema({
  timestamps: true,
  strict: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class OfficialHoliday implements IOfficialHoliday {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ required: true })
  year: number;

  @Prop({ default: false })
  isRecurring: boolean;

  @Prop({ required: false, default: false })
  freezedAt: boolean;
}

export type OfficialHolidayDocument = HydratedDocument<OfficialHoliday>;

export const OfficialHolidaySchema = SchemaFactory.createForClass(OfficialHoliday);

OfficialHolidaySchema.pre(['findOne', 'find'], function (next) {
  const query = this.getQuery();

  if (query.paranoid === false) {
    this.setQuery({ ...query })
  } else {
    this.setQuery({ ...query, freezedAt: { $exists: false } })

  }
  next();
})

OfficialHolidaySchema.index({ year: 1, date: 1 });

export const OfficialHolidayModel = MongooseModule.forFeature([
  {
    name: OfficialHoliday.name,
    schema: OfficialHolidaySchema,
  },
]);
