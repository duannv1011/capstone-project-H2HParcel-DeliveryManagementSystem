import { Controller, Get } from '@nestjs/common';
import { StatusService } from './status.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('status')
@ApiTags('Status')
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
    @Get('getAllOrderStatus')
    async getAllOrderStatus() {
        return await this.statusService.getAllOrderStatus();
    }
    @Get('getAllRequestStatus')
    async getAllRequestStatus() {
        return await this.statusService.getAllRequestStatus();
    }
    @Get('getAllRequestType')
    async getAllRequestType() {
        return await this.statusService.getAllRequestType();
    }
    @Get('package-type')
    async getAllPackageType() {
        return await this.statusService.getAllPackageType();
    }
}
