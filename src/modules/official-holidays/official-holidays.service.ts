import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOfficialHolidayDto } from './dto/create-official-holiday.dto';
import { UpdateOfficialHolidayDto } from './dto/update-official-holiday.dto';
import { OfficialHolidayRepository } from 'src/db';

@Injectable()
export class OfficialHolidaysService {
  constructor(
    private readonly officialHolidayRepository: OfficialHolidayRepository,
  ) { }

  /**
   * Create Official Holiday - إضافة إجازة رسمية
   */
  async create(createOfficialHolidayDto: CreateOfficialHolidayDto) {

    // Validate year
    if (createOfficialHolidayDto.year < 2008) {
      throw new BadRequestException('السنة يجب ألا تقل عن 2008');
    }

    const holiday = await this.officialHolidayRepository.create({
      data: [{
        ...createOfficialHolidayDto,
        date: new Date(createOfficialHolidayDto.date),
        isRecurring: createOfficialHolidayDto.isRecurring || false,
      }]
    });

    return {
      message: 'تم إضافة الإجازة الرسمية بنجاح',
      data: holiday,
    };
  }

  /**
   * Find All Official Holidays
   */
  async findAll(year?: number) {
    const filter = year ? { year } : {};
    const holidays = await this.officialHolidayRepository.find({
      filter: filter,
      options: { sort: { date: 1 } },
    });

    return {
      data: holidays,
      total: holidays.length,
    };
  }

  /**
   * Find One Official Holiday
   */
  async findOne(id: string) {
    const holiday = await this.officialHolidayRepository.findOne({ filter: { _id: id } });

    if (!holiday) {
      throw new NotFoundException('الإجازة الرسمية غير موجودة');
    }

    return {
      data: holiday,
    };
  }

  /**
   * Update Official Holiday
   */
  async update(id: string, updateOfficialHolidayDto: UpdateOfficialHolidayDto) {
    const existing = await this.officialHolidayRepository.findOne({ filter: { _id: id } });

    if (!existing) {
      throw new NotFoundException('الإجازة الرسمية غير موجودة');
    }

    // Validate year if provided
    if (
      updateOfficialHolidayDto.year &&
      updateOfficialHolidayDto.year < 2008
    ) {
      throw new BadRequestException('السنة يجب ألا تقل عن 2008');
    }

    // Convert date string to Date if provided
    const updateData: any = { ...updateOfficialHolidayDto };
    if (updateOfficialHolidayDto.date) {
      updateData.date = new Date(updateOfficialHolidayDto.date);
    }

    const holiday = await this.officialHolidayRepository.findOneAndUpdate(
      { filter: { _id: id }, update: updateData },
    );

    return {
      message: 'تم تعديل الإجازة الرسمية بنجاح',
      data: holiday,
    };
  }

  /**
   * Remove Official Holiday
   */
  async remove(id: string) {
    const holiday = await this.officialHolidayRepository.findOneAndDelete({ filter: { _id: id } });

    if (!holiday) {
      throw new NotFoundException('الإجازة الرسمية غير موجودة');
    }

    return {
      message: 'تم حذف الإجازة الرسمية بنجاح',
    };
  }

  /**
   * Get Holidays by Year
   */
  async getByYear(year: number) {
    const holidays = await this.officialHolidayRepository.find({
      filter: { year },
      options: { sort: { date: 1 } },
    });

    return {
      data: holidays,
      total: holidays.length,
    };
  }

  /**
   * Check if date is a holiday
   */
  async isHoliday(date: Date): Promise<boolean> {
    const year = date.getFullYear();
    const holidays = await this.officialHolidayRepository.find({
      filter: { year },
    });

    return holidays.some((holiday: any) => {
      const holidayDate = new Date(holiday.date);
      return (
        holidayDate.getDate() === date.getDate() &&
        holidayDate.getMonth() === date.getMonth()
      );
    });
  }
}
