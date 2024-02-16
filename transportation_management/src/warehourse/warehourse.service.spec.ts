import { Test, TestingModule } from '@nestjs/testing';
import { WarehourseService } from './warehourse.service';

describe('WarehourseService', () => {
  let service: WarehourseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WarehourseService],
    }).compile();

    service = module.get<WarehourseService>(WarehourseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
