import { Module } from '@nestjs/common';
import { WhitehourseController } from './whitehourse.controller';
import { WhitehourseService } from './whitehourse.service';

@Module({
    controllers: [WhitehourseController],
    providers: [WhitehourseService],
})
export class WhitehourseModule {}
