import { Test, TestingModule } from '@nestjs/testing';
import { SalaryReportService } from './salary-report.service';

describe('SalaryReportService', () => {
  let service: SalaryReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SalaryReportService],
    }).compile();

    service = module.get<SalaryReportService>(SalaryReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
