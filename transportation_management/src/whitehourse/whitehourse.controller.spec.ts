import { Test, TestingModule } from '@nestjs/testing';
import { WhitehourseController } from './whitehourse.controller';

describe('WhitehourseController', () => {
    let controller: WhitehourseController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [WhitehourseController],
        }).compile();

        controller = module.get<WhitehourseController>(WhitehourseController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
