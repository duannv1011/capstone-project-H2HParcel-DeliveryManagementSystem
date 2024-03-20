import { Body, Controller, Get, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/role.decorator';
import { Role } from 'src/enum/roles.enum';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { AdminService } from './admin.service';
import { CustomerStatusUpdateDTO } from '../dto/customer-status-update.dto';
import { CustomerService } from 'src/module/client/customer/modules/customer.service';
import { CreateStaffDto } from '../dto/staff-create.dto';
import { StaffService } from 'src/module/core/staff/staff.service';

@Controller('admin')
@ApiTags('SUPER ADMIN')
export class AdminController {
    constructor(
        private adminService: AdminService,
        private customerService: CustomerService,
        private staffService: StaffService,
        private configService: ConfigService,
    ) {}
    @Get('admin')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    async HelloAdminOlyEnpoin() {
        return 'Welcome admin';
    }
    @Get('getAllWarehouse')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    async getAllWarehouse(@Query('pageNo') pageNo: string): Promise<any> {
        const pagesize = this.configService.get<string>('PAGE_SIZE');
        return this.adminService.getAllWarehouse(Number(pageNo), Number(pagesize));
    }

    @Get('getAllAccount')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    async getAllAccounts(@Query('pageNo') pageNo: string): Promise<any> {
        const pagesize = this.configService.get<string>('PAGE_SIZE');
        return this.adminService.findAllAccount(Number(pageNo), Number(pagesize));
    }
    @Get('getAllCustomer')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    async getAllCustomer(@Query('pageNo') pageNo: string): Promise<any> {
        const pagesize = this.configService.get<string>('PAGE_SIZE');
        return this.adminService.getAllCustomer(Number(pageNo), Number(pagesize));
    }

    @Get('getAllStaff')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    async getAllStaff(@Query('pageNo') pageNo: string): Promise<any> {
        return this.adminService.getAllStaff(Number(pageNo));
    }
    @Get('getAllStaffByRole')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    async getAllStaffByRole(@Query('pageNo') pageNo: string, @Query('role_id') role_id: number): Promise<any> {
        return this.adminService.getAllStaffByRole(Number(pageNo), role_id);
    }

    @Patch('updateCustomerStatus')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Update customer status' })
    @ApiResponse({ status: 200, description: 'Updated customer status successfully.' })
    async updateCustomerStatus(@Body() customerStatusUpdateDTO: CustomerStatusUpdateDTO): Promise<any> {
        return await this.customerService.updateCustomerStatus(
            customerStatusUpdateDTO.cus_id,
            customerStatusUpdateDTO.status,
        );
    }
    @Post('updateStaff')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Update staff data' })
    @ApiResponse({ status: 200, description: 'Update staff data successfully.' })
    async updateStaff(): Promise<any> {
        return 'test api';
    }
    @Post('createStaff')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'admin create staff' })
    @ApiResponse({ status: 200, description: 'admin create staff successfully.' })
    async createStaff(@Body() createStafDto: CreateStaffDto): Promise<any> {
        return await this.staffService.updateCustomerStatus(createStafDto);
    }
}
