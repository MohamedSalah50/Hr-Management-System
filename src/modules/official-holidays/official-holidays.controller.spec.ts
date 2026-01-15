import { Test, TestingModule } from '@nestjs/testing';
import { OfficialHolidaysController } from './official-holidays.controller';
import { OfficialHolidaysService } from './official-holidays.service';

describe('OfficialHolidaysController', () => {
  let controller: OfficialHolidaysController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OfficialHolidaysController],
      providers: [OfficialHolidaysService],
    }).compile();

    controller = module.get<OfficialHolidaysController>(OfficialHolidaysController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
