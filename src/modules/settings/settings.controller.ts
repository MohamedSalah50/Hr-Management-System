import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Patch,
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
  constructor(private readonly settingsService: SettingsService) { }

  @Post()
  upsert(@Body() createSettingDto: CreateSettingDto) {
    return this.settingsService.upsert(createSettingDto);
  }


  @Get()
  findAll() {
    return this.settingsService.findAll();
  }


  @Get('general')
  getGeneralSettings() {
    return this.settingsService.getGeneralSettings();
  }


  @Get(':key')
  findByKey(@Param('key') key: string) {
    return this.settingsService.findByKey(key);
  }


  @Patch(':key/soft-delete')
  remove(@Param('key') key: string) {
    return this.settingsService.softDelete(key);
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
