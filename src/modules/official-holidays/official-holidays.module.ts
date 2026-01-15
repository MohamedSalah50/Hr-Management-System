import { Module } from '@nestjs/common';
import { OfficialHolidaysService } from './official-holidays.service';
import { OfficialHolidaysController } from './official-holidays.controller';
import { OfficialHolidayModel, OfficialHolidayRepository } from 'src/db';

@Module({
  imports: [OfficialHolidayModel],
  controllers: [OfficialHolidaysController],
  providers: [OfficialHolidaysService, OfficialHolidayRepository],
})
export class OfficialHolidaysModule { }
