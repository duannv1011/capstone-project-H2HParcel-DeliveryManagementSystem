import { Controller, Get } from '@nestjs/common';
import { StatusService } from './status.service';

@Controller('status')
export class StatusController {
    constructor(private readonly statusService: StatusService) {}
    @Get('getAllCustomerStatus')
    async getAllCustomerStatus() {
        return await this.statusService.getAllCustomerStatus();
    }
    @Get('getAllStaffStatus')
    async getAllStaffStatus() {
        return await this.statusService.getAllStaffStatus();
    }
}
