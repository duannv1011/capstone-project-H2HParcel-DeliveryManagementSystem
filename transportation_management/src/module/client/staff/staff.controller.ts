import { Controller, Get, UseGuards } from '@nestjs/common';
import { StaffService } from './staff.service';
import { AuthenticationGuard } from '../../core/authentication/modules/authentication.guard';

@Controller('staff')
export class StaffController {
    constructor(private readonly staffService: StaffService) {}

    @UseGuards(AuthenticationGuard)
    @Get('test')
    test(): string {
        return 'OK';
    }
}
