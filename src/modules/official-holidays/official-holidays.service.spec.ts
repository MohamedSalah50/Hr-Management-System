import { Test, TestingModule } from '@nestjs/testing';
import { OfficialHolidaysService } from './official-holidays.service';

describe('OfficialHolidaysService', () => {
  let service: OfficialHolidaysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OfficialHolidaysService],
    }).compile();

    service = module.get<OfficialHolidaysService>(OfficialHolidaysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
