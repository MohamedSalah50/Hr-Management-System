import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { SalaryReportService } from './salary-report.service';
import { GenerateReportDto } from './dto/generate-report.dto';
import { SearchReportDto } from './dto/search-report.dto';
import { auth } from 'src/common/decorators/auth.decorator';
import { RoleEnum } from 'src/common';

@auth([RoleEnum.admin, RoleEnum.superAdmin])
@Controller('salary-reports')
export class SalaryReportController {
  constructor(private readonly salaryReportService: SalaryReportService) {}

  @Post('generate')
  generateReport(@Body() generateReportDto: GenerateReportDto) {
    return this.salaryReportService.generateReport(generateReportDto);
  }

  @Post('generate-all')
  generateAll(@Body() body: { month: number; year: number }) {
    return this.salaryReportService.generateReportsForAll(
      body.month,
      body.year,
    );
  }

  @Get()
  findAll() {
    return this.salaryReportService.findAll();
  }

  @Post('search')
  search(@Body() searchDto: SearchReportDto) {
    return this.salaryReportService.search(searchDto);
  }

  @Get('summary')
  getSummary(@Query('month') month: string, @Query('year') year: string) {
    return this.salaryReportService.getSummary(parseInt(month), parseInt(year));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salaryReportService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salaryReportService.remove(id);
  }

  @Get(':id/print')
  getForPrint(@Param('id') id: string) {
    return this.salaryReportService.getReportForPrint(id);
  }

  @Post('regenerate')
  regenerate(@Body() generateReportDto: GenerateReportDto) {
    return this.salaryReportService.regenerateReport(generateReportDto);
  }
}
