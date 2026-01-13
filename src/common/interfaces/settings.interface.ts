import { SettingsEnum } from '../enums';

export interface ISettings {
  key: string;
  value: string;
  dataType: SettingsEnum;
  description?: string;
}
