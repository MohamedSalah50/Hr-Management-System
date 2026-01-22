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

  // settings.service.ts - Improved Version

  /**
   * Save Overtime & Deduction Settings
   * Validation Rules من SRS (Section 5)
   */
  async saveOvertimeDeductionSettings(dto: OvertimeDeductionSettingsDto) {
    // Validation Rule #2: Check if all fields are filled
    if (
      dto.overtimeRatePerHour === undefined ||
      dto.overtimeRatePerHour === null ||
      dto.deductionRatePerHour === undefined ||
      dto.deductionRatePerHour === null
    ) {
      throw new BadRequestException('من فضلك ادخال بيانات الحقل');
    }

    // Additional validation: rates should be positive
    if (dto.overtimeRatePerHour < 0 || dto.deductionRatePerHour < 0) {
      throw new BadRequestException('يجب أن تكون القيم موجبة');
    }

    // Save overtime rate
    await this.upsert({
      key: 'overtime_rate_per_hour',
      value: dto.overtimeRatePerHour,
      dataType: SettingsEnum.Number,
      description: 'معدل الإضافة للساعة الواحدة',
    });

    // Save deduction rate
    await this.upsert({
      key: 'deduction_rate_per_hour',
      value: dto.deductionRatePerHour,
      dataType: SettingsEnum.Number,
      description: 'معدل الخصم للساعة الواحدة',
    });

    // Validation Rule #1: Success message (تم الحفظ بنجاح)
    return {
      message: 'تم الحفظ بنجاح',
      data: {
        overtimeRatePerHour: dto.overtimeRatePerHour,
        deductionRatePerHour: dto.deductionRatePerHour,
      },
    };
  }

  /**
   * Get Overtime & Deduction Settings
   */
  async getOvertimeDeductionSettings() {
    const overtimeRate = await this.settingRepository.findOne({
      filter: { key: 'overtime_rate_per_hour' },
    });
    const deductionRate = await this.settingRepository.findOne({
      filter: { key: 'deduction_rate_per_hour' },
    });

    return {
      data: {
        overtimeRatePerHour: overtimeRate?.value || 0,
        deductionRatePerHour: deductionRate?.value || 0,
      },
    };
  }

  /**
   * Save Weekend Settings
   * يقوم HR بتحديد أيام الإجازة (الجمعة والسبت أو الجمعة فقط)
   */
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
