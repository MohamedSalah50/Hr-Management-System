import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { OvertimeDeductionSettingsDto } from './dto/overtime-deduction-settings.dto';
import { WeekendSettingsDto } from './dto/weekend-settings.dto';
import { RoleEnum } from 'src/common';
import { auth } from 'src/common/decorators/auth.decorator';

@auth([RoleEnum.admin, RoleEnum.superAdmin])
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  upsert(@Body() createSettingDto: CreateSettingDto) {
    return this.settingsService.upsert(createSettingDto);
  }

  /**
   * GET /settings - Get All Settings
   */
  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  /**
   * GET /settings/general - Get General Settings (Combined)
   */
  @Get('general')
  getGeneralSettings() {
    return this.settingsService.getGeneralSettings();
  }

  /**
   * GET /settings/:key - Get Setting by Key
   */
  @Get(':key')
  findByKey(@Param('key') key: string) {
    return this.settingsService.findByKey(key);
  }

  /**
   * DELETE /settings/:key - Delete Setting
   */
  @Delete(':key')
  remove(@Param('key') key: string) {
    return this.settingsService.remove(key);
  }

  /**
   * PUT /settings/overtime-deduction - Save Overtime & Deduction Settings
   */
  @Put('overtime-deduction')
  saveOvertimeDeductionSettings(@Body() dto: OvertimeDeductionSettingsDto) {
    return this.settingsService.saveOvertimeDeductionSettings(dto);
  }

  /**
   * GET /settings/overtime-deduction - Get Overtime & Deduction Settings
   */
  @Get('overtime-deduction/current')
  getOvertimeDeductionSettings() {
    return this.settingsService.getOvertimeDeductionSettings();
  }

  /**
   * PUT /settings/weekend - Save Weekend Settings
   */
  @Put('weekend')
  saveWeekendSettings(@Body() dto: WeekendSettingsDto) {
    return this.settingsService.saveWeekendSettings(dto);
  }

  /**
   * GET /settings/weekend - Get Weekend Settings
   */
  @Get('weekend/current')
  getWeekendSettings() {
    return this.settingsService.getWeekendSettings();
  }
}
