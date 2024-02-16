import { Test, TestingModule } from '@nestjs/testing';
import { WarehourseController } from './warehourse.controller';

describe('WarehourseController', () => {
    let controller: WarehourseController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [WarehourseController],
        }).compile();

        controller = module.get<WarehourseController>(WarehourseController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
