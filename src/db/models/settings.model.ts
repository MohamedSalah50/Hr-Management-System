import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ISettings, SettingsEnum } from 'src/common';

@Schema({
  timestamps: true,
  strict: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Setting implements ISettings {
  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ required: true, type: Object })
  value: any;

  @Prop({
    required: true,
    enum: SettingsEnum,
    default: SettingsEnum.String,
  })
  dataType: SettingsEnum;

  @Prop()
  description: string;

  @Prop({ required: false })
  freezedAt: boolean;
}

export type SettingDocument = HydratedDocument<Setting>;

export const SettingSchema = SchemaFactory.createForClass(Setting);


SettingSchema.pre(['findOne', 'find'], function (next) {
  const query = this.getQuery();

  if (query.paranoid === false) {
    this.setQuery({ ...query })
  } else {
    this.setQuery({ ...query, freezedAt: { $exists: false } })

  }
})


export const SettingModel = MongooseModule.forFeature([
  {
    name: Setting.name,
    schema: SettingSchema,
  },
]);
