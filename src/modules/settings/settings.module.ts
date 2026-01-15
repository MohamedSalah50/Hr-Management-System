import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { SettingModel, SettingRepository } from 'src/db';

@Module({
  imports: [SettingModel],
  controllers: [SettingsController],
  providers: [SettingsService, SettingRepository],
})
export class SettingsModule { }
