import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';

import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { auth } from 'src/common/decorators/auth.decorator';
import { RoleEnum } from 'src/common';
import { SearchAttendanceDto } from './dto/search-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@auth([RoleEnum.admin, RoleEnum.superAdmin, RoleEnum.user])
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(createAttendanceDto);
  }

  @Get()
  findAll() {
    return this.attendanceService.findAll();
  }

  @Post('search')
  search(@Body() searchDto: SearchAttendanceDto) {
    return this.attendanceService.search(searchDto);
  }

  @Get('statistics/:employeeId')
  getStatistics(
    @Param('employeeId') employeeId: string,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.attendanceService.getStatistics(
      employeeId,
      parseInt(month),
      parseInt(year),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(id, updateAttendanceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(id);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  importExcel(@UploadedFile() file: Express.Multer.File) {
    return this.attendanceService.importFromExcel(file);
  }

  @Post('export')
  async exportExcel(
    @Body() searchDto: SearchAttendanceDto,
    @Res() res: Response,
  ) {
    const buffer = await this.attendanceService.exportToExcel(searchDto);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=attendance-${Date.now()}.xlsx`,
    );

    res.send(buffer);
  }
}
