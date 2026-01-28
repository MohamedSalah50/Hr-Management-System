import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { OfficialHolidaysService } from './official-holidays.service';
import { CreateOfficialHolidayDto } from './dto/create-official-holiday.dto';
import { UpdateOfficialHolidayDto } from './dto/update-official-holiday.dto';
import { RoleEnum } from 'src/common';
import { auth } from 'src/common/decorators/auth.decorator';

@auth([RoleEnum.admin, RoleEnum.superAdmin, RoleEnum.user])
@Controller('official-holidays')
export class OfficialHolidaysController {
  constructor(
    private readonly officialHolidaysService: OfficialHolidaysService,
  ) {}

  @Post()
  create(@Body() createOfficialHolidayDto: CreateOfficialHolidayDto) {
    return this.officialHolidaysService.create(createOfficialHolidayDto);
  }

  @Get()
  findAll(@Query('year') year?: string) {
    const yearNumber = year ? parseInt(year, 10) : undefined;
    return this.officialHolidaysService.findAll(yearNumber);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.officialHolidaysService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOfficialHolidayDto: UpdateOfficialHolidayDto,
  ) {
    return this.officialHolidaysService.update(id, updateOfficialHolidayDto);
  }

  @Patch(':id')
  remove(@Param('id') id: string) {
    return this.officialHolidaysService.softDelete(id);
  }
}
