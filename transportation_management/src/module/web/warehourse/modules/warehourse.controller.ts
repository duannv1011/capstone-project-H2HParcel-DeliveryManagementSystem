import { Controller } from '@nestjs/common';

import { WarehourseService } from './warehourse.service';

import { ConfigService } from '@nestjs/config';

@Controller('warehourse')
export class WarehourseController {
    constructor(
        private readonly warehouseService: WarehourseService,
        private configService: ConfigService,
    ) {}
}
