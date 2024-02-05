import { Test, TestingModule } from '@nestjs/testing';
import { WhitehourseService } from './whitehourse.service';

describe('WhitehourseService', () => {
    let service: WhitehourseService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [WhitehourseService],
        }).compile();

        service = module.get<WhitehourseService>(WhitehourseService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
