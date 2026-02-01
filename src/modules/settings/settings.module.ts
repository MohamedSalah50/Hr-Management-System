import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { SettingModel, SettingRepository, UserModel, UserRepository } from 'src/db';

@Module({
  imports: [SettingModel, UserModel],
  controllers: [SettingsController],
  providers: [SettingsService, SettingRepository, UserRepository],
})
export class SettingsModule { }
