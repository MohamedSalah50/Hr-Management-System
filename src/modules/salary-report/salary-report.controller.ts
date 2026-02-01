import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Patch,
} from '@nestjs/common';
import { SalaryReportService } from './salary-report.service';
import { GenerateReportDto } from './dto/generate-report.dto';
import { SearchReportDto } from './dto/search-report.dto';
import { auth } from 'src/common/decorators/auth.decorator';
import { RoleEnum } from 'src/common';
import { Types } from 'mongoose';

@auth([RoleEnum.admin, RoleEnum.user])
@Controller('salary-reports')
export class SalaryReportController {
  constructor(private readonly salaryReportService: SalaryReportService) { }

  @Post('generate/:userId')
  generateReport(@Body() generateReportDto: GenerateReportDto, @Param('userId') userId: Types.ObjectId) {
    return this.salaryReportService.generateReport(generateReportDto, userId);
  }

  // @Post('generate-all')
  // generateAll(@Body() body: { month: number; year: number }) {
  //   return this.salaryReportService.generateReportsForAll(
  //     body.month,
  //     body.year,
  //   );
  // }

  @Get(":userId")
  findAll(@Param('userId') userId: Types.ObjectId) {
    return this.salaryReportService.findAll(userId);
  }

  @Post('search')
  search(@Body() searchDto: SearchReportDto) {
    return this.salaryReportService.search(searchDto);
  }

  @Get('summary')
  getSummary(@Query('month') month: string, @Query('year') year: string) {
    return this.salaryReportService.getSummary(parseInt(month), parseInt(year));
  }

  @Get(':id/:userId')
  findOne(@Param('id') id: string, @Param('userId') userId: Types.ObjectId) {
    return this.salaryReportService.findOne(id, userId);
  }

  @Patch(':id/soft-delete/:userId')
  remove(@Param('id') id: string, @Param('userId') userId: Types.ObjectId) {
    return this.salaryReportService.softDelete(id, userId);
  }

  // @Get(':id/print')
  // getForPrint(@Param('id') id: string) {
  //   return this.salaryReportService.getReportForPrint(id);
  // }

  // @Post('regenerate')
  // regenerate(@Body() generateReportDto: GenerateReportDto) {
  //   return this.salaryReportService.regenerateReport(generateReportDto);
  // }
}
