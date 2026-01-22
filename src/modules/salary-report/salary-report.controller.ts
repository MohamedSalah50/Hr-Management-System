import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { RoleEnum } from 'src/common';
import { auth } from 'src/common/decorators/auth.decorator';
import { SalaryReportService } from './salary-report.service';
import { GenerateReportDto } from './dto/generate-report.dto';
import { SearchReportDto } from './dto/search-report.dto';

@auth([RoleEnum.admin, RoleEnum.superAdmin, RoleEnum.user])
@Controller('salary-reports')
export class SalaryReportController {
  constructor(private readonly salaryReportsService: SalaryReportService) {}

  /**
   * POST /salary-reports/generate - Generate report for single employee
   */
  @Post('generate')
  generateReport(@Body() generateReportDto: GenerateReportDto) {
    return this.salaryReportsService.generateReport(generateReportDto);
  }

  /**
   * POST /salary-reports/generate-all - Generate reports for all employees
   */
  @Post('generate-all')
  generateReportsForAll(@Body() body: { month: number; year: number }) {
    return this.salaryReportsService.generateReportsForAll(
      body.month,
      body.year,
    );
  }

  /**
   * POST /salary-reports/regenerate - Regenerate report (delete old & create new)
   */
  @Post('regenerate')
  regenerateReport(@Body() generateReportDto: GenerateReportDto) {
    return this.salaryReportsService.regenerateReport(generateReportDto);
  }

  /**
   * GET /salary-reports - Get all reports
   */
  @Get()
  findAll() {
    return this.salaryReportsService.findAll();
  }

  /**
   * POST /salary-reports/search - Search reports
   */
  @Post('search')
  search(@Body() searchDto: SearchReportDto) {
    return this.salaryReportsService.search(searchDto);
  }

  /**
   * GET /salary-reports/summary?month=1&year=2024 - Get summary
   */
  @Get('summary')
  getSummary(@Query('month') month: string, @Query('year') year: string) {
    return this.salaryReportsService.getSummary(
      parseInt(month),
      parseInt(year),
    );
  }

  /**
   * GET /salary-reports/:id - Get single report
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salaryReportsService.findOne(id);
  }

  /**
   * GET /salary-reports/:id/print - Get report formatted for printing
   */
  @Get(':id/print')
  getReportForPrint(@Param('id') id: string) {
    return this.salaryReportsService.getReportForPrint(id);
  }

  /**
   * DELETE /salary-reports/:id - Delete report
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salaryReportsService.remove(id);
  }
}
