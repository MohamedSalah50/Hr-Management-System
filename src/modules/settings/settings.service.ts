import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSettingDto } from './dto/create-setting.dto';
import { SettingRepository } from 'src/db';
import { OvertimeDeductionSettingsDto } from './dto/overtime-deduction-settings.dto';
import { SettingsEnum } from 'src/common';
import { WeekendSettingsDto } from './dto/weekend-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly settingRepository: SettingRepository) {}
  async upsert(createSettingDto: CreateSettingDto) {
    const existing = await this.settingRepository.findOne({
      filter: { key: createSettingDto.key },
    });

    if (existing) {
      const updated = await this.settingRepository.findOneAndUpdate({
        filter: { _id: existing._id.toString() },
        update: {
          $set: {
            value: createSettingDto.value,
            dataType: createSettingDto.dataType,
            description: createSettingDto.description,
          },
        },
      });

      return {
        message: 'تم تحديث الإعداد بنجاح',
        data: updated,
      };
    }

    const setting = await this.settingRepository.create({
      data: [{ ...createSettingDto }],
    });

    return {
      message: 'تم إضافة الإعداد بنجاح',
      data: setting,
    };
  }

  /**
   * Get All Settings
   */
  async findAll() {
    const settings = await this.settingRepository.find({ filter: {} });
    return {
      data: settings,
      total: settings.length,
    };
  }

  /**
   * Get Setting by Key
   */
  async findByKey(key: string) {
    const setting = await this.settingRepository.findOne({ filter: { key } });

    if (!setting) {
      throw new NotFoundException('الإعداد غير موجود');
    }

    return {
      data: setting,
    };
  }

  /**
   * Delete Setting
   */
  async remove(key: string) {
    const setting = await this.settingRepository.findOne({ filter: { key } });

    if (!setting) {
      throw new NotFoundException('الإعداد غير موجود');
    }

    await this.settingRepository.findOneAndDelete({
      filter: { _id: setting._id.toString() },
    });

    return {
      message: 'تم حذف الإعداد بنجاح',
    };
  }

  async saveOvertimeDeductionSettings(dto: OvertimeDeductionSettingsDto) {
    // Validation
    if (
      dto.overtimeHoursMultiplier === undefined ||
      dto.overtimeHoursMultiplier === null ||
      dto.deductionHoursMultiplier === undefined ||
      dto.deductionHoursMultiplier === null ||
      dto.workingHoursPerDay === undefined ||
      dto.workingHoursPerDay === null
    ) {
      throw new BadRequestException('من فضلك ادخال بيانات الحقل');
    }

    if (
      dto.overtimeHoursMultiplier < 0 ||
      dto.deductionHoursMultiplier < 0 ||
      dto.workingHoursPerDay <= 0
    ) {
      throw new BadRequestException('يجب أن تكون القيم صحيحة');
    }

    // Save overtime multiplier
    await this.upsert({
      key: 'overtime_hours_multiplier',
      value: dto.overtimeHoursMultiplier,
      dataType: SettingsEnum.Number,
      description: 'معامل ضرب ساعات الإضافي',
    });

    // Save deduction multiplier
    await this.upsert({
      key: 'deduction_hours_multiplier',
      value: dto.deductionHoursMultiplier,
      dataType: SettingsEnum.Number,
      description: 'معامل ضرب ساعات التأخير للخصم',
    });

    // Save working hours per day
    await this.upsert({
      key: 'working_hours_per_day',
      value: dto.workingHoursPerDay,
      dataType: SettingsEnum.Number,
      description: 'عدد ساعات العمل في اليوم',
    });

    return {
      message: 'تم الحفظ بنجاح',
      data: {
        overtimeHoursMultiplier: dto.overtimeHoursMultiplier,
        deductionHoursMultiplier: dto.deductionHoursMultiplier,
        workingHoursPerDay: dto.workingHoursPerDay,
      },
    };
  }

  async getOvertimeDeductionSettings() {
    const overtimeMultiplier = await this.settingRepository.findOne({
      filter: { key: 'overtime_hours_multiplier' },
    });
    const deductionMultiplier = await this.settingRepository.findOne({
      filter: { key: 'deduction_hours_multiplier' },
    });
    const workingHoursPerDay = await this.settingRepository.findOne({
      filter: { key: 'working_hours_per_day' },
    });

    return {
      data: {
        overtimeHoursMultiplier: overtimeMultiplier?.value || 1.5,
        deductionHoursMultiplier: deductionMultiplier?.value || 2,
        workingHoursPerDay: workingHoursPerDay?.value || 8,
      },
    };
  }

  async saveWeekendSettings(dto: WeekendSettingsDto) {
    // Validation Rule #2: Check if weekend days are provided
    if (!dto.weekendDays || dto.weekendDays.length === 0) {
      throw new BadRequestException('من فضلك ادخال بيانات الحقل');
    }

    // Validate days (only Friday and Saturday allowed based on SRS)
    const allowedDays = ['Friday', 'Saturday'];
    const invalidDays = dto.weekendDays.filter(
      (day) => !allowedDays.includes(day),
    );

    if (invalidDays.length > 0) {
      throw new BadRequestException(
        'أيام الإجازة المسموحة هي الجمعة والسبت فقط',
      );
    }

    await this.upsert({
      key: 'weekend_days',
      value: dto.weekendDays,
      dataType: SettingsEnum.Array,
      description: 'أيام الإجازة الأسبوعية',
    });

    // Validation Rule #1: Success message
    return {
      message: 'تم الحفظ بنجاح',
      data: {
        weekendDays: dto.weekendDays,
      },
    };
  }

  /**
   * Get Weekend Settings
   */
  async getWeekendSettings() {
    const weekendDays = await this.settingRepository.findOne({
      filter: { key: 'weekend_days' },
    });

    return {
      data: {
        weekendDays: weekendDays?.value || [],
      },
    };
  }

  /**
   * Get All General Settings (Combined)
   */
  async getGeneralSettings() {
    const overtimeDeduction = await this.getOvertimeDeductionSettings();
    const weekend = await this.getWeekendSettings();

    return {
      data: {
        ...overtimeDeduction.data,
        ...weekend.data,
      },
    };
  }
}
