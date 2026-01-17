import { Test, TestingModule } from '@nestjs/testing';
import { SalaryReportController } from './salary-report.controller';
import { SalaryReportService } from './salary-report.service';

describe('SalaryReportController', () => {
  let controller: SalaryReportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalaryReportController],
      providers: [SalaryReportService],
    }).compile();

    controller = module.get<SalaryReportController>(SalaryReportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
