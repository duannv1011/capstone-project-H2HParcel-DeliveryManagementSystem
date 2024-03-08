import { Module } from '@nestjs/common';
import { WarehourseService } from './warehourse.service';
import { WarehourseController } from './warehourse.controller';

@Module({
    providers: [WarehourseService],
    controllers: [WarehourseController],
})
export class WarehourseModule {}
