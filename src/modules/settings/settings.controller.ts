import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Patch,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { OvertimeDeductionSettingsDto } from './dto/overtime-deduction-settings.dto';
import { WeekendSettingsDto } from './dto/weekend-settings.dto';
import { RoleEnum } from 'src/common';
import { auth } from 'src/common/decorators/auth.decorator';
import { Types } from 'mongoose';

@auth([RoleEnum.admin, RoleEnum.superAdmin])
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) { }

  @Post()
  upsert(@Body() createSettingDto: CreateSettingDto) {
    return this.settingsService.upsert(createSettingDto);
  }


  @Get(":userId")
  findAll(@Param('userId') userId: Types.ObjectId) {
    return this.settingsService.findAll(userId);
  }


  @Get('general')
  getGeneralSettings() {
    return this.settingsService.getGeneralSettings();
  }


  @Get(':key/:userId')
  findByKey(@Param('key') key: string, @Param('userId') userId: Types.ObjectId) {
    return this.settingsService.findByKey(key, userId);
  }


  @Patch(':key/soft-delete/:userId')
  remove(@Param('key') key: string, @Param('userId') userId: Types.ObjectId) {
      return this.settingsService.softDelete(key, userId);
  }


  @Put('overtime-deduction')
  saveOvertimeDeductionSettings(@Body() dto: OvertimeDeductionSettingsDto) {
    return this.settingsService.saveOvertimeDeductionSettings(dto);
  }


  @Get('overtime-deduction/current')
  getOvertimeDeductionSettings() {
    return this.settingsService.getOvertimeDeductionSettings();
  }


  @Put('weekend')
  saveWeekendSettings(@Body() dto: WeekendSettingsDto) {
    return this.settingsService.saveWeekendSettings(dto);
  }


  @Get('weekend/current')
  getWeekendSettings() {
    return this.settingsService.getWeekendSettings();
  }
}
