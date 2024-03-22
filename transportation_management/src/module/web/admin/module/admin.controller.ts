import { Body, Controller, Get, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
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
import { WarehourseService } from '../../warehourse/modules/warehourse.service';
import { CreateWarehouseDto } from '../../warehourse/dto/createWarehouse_dto';
import { UpdateWarehouseDto } from '../../warehourse/dto/updateWarehoue_dto';
import { updateActiveDto } from '../../warehourse/dto/changeActive_dto';
import { updateStaffDto } from '../dto/staff-update.dto';
import { setStaffToManagerDto } from '../dto/staff-update-to-manager.dto';

@Controller('admin')
@ApiTags('SUPER ADMIN')
export class AdminController {
    constructor(
        private adminService: AdminService,
        private customerService: CustomerService,
        private staffService: StaffService,
        private configService: ConfigService,
        private readonly warehouseService: WarehourseService,
    ) {}
    @Get('getAllWarehouse')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'get All Warehouse' })
    @ApiResponse({ status: 200, description: 'get All Warehouse successfully.' })
    async getAllWarehouse(@Query('pageNo') pageNo: string): Promise<any> {
        const pagesize = this.configService.get<string>('PAGE_SIZE');
        return this.adminService.getAllWarehouse(Number(pageNo), Number(pagesize));
    }
    @Get('getDetailWarehouse')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'get Detail of Warehouse' })
    @ApiResponse({ status: 200, description: 'get Warehouse data successfully.' })
    async getDetailWarehouse(@Query('warehouse_id') warehouse_id: string): Promise<any> {
        return this.warehouseService.getDetailWarehouse(Number(warehouse_id));
    }
    @Post('createWarehouse')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'create new Warehouse' })
    @ApiResponse({ status: 200, description: 'create Warehouse successfully.' })
    async createWarehouse(@Body() data: CreateWarehouseDto): Promise<any> {
        return this.warehouseService.createWarehouse(data);
    }
    @Put('updateWarehouse')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'update Warehouse' })
    @ApiResponse({ status: 200, description: 'update Warehouse successfully.' })
    async updateWarehouse(@Body() data: UpdateWarehouseDto): Promise<any> {
        return this.warehouseService.updateWarehouse(data);
    }
    @Put('changeActiveWarehouse')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'update status Warehouse' })
    @ApiResponse({ status: 200, description: 'update  Warehouse status successfully.' })
    async changeActiveWarehouse(@Body() data: updateActiveDto): Promise<any> {
        return this.warehouseService.updateActive(data);
    }
    @Get('getAllAccount')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'get All Account' })
    @ApiResponse({ status: 200, description: 'get All Account successfully.' })
    async getAllAccounts(@Query('pageNo') pageNo: string): Promise<any> {
        const pagesize = this.configService.get<string>('PAGE_SIZE');
        return this.adminService.findAllAccount(Number(pageNo), Number(pagesize));
    }
    @Get('getAllRoleStaff')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'get All Role of Staff' })
    @ApiResponse({ status: 200, description: 'get All Role of Staff successfully.' })
    async getAllRoleStaff(): Promise<any> {
        return this.adminService.getAllRoleStaff();
    }
    @Get('getAllCustomer')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'get All Customer' })
    @ApiResponse({ status: 200, description: 'get All Customer successfully.' })
    async getAllCustomer(@Query('pageNo') pageNo: string): Promise<any> {
        const pagesize = this.configService.get<string>('PAGE_SIZE');
        return this.adminService.getAllCustomer(Number(pageNo), Number(pagesize));
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
    @Get('getAllStaff')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'get All Staffs except Admin' })
    @ApiResponse({ status: 200, description: 'get All Staffs successfully.' })
    async getAllStaff(@Query('pageNo') pageNo: string): Promise<any> {
        return this.adminService.getAllStaff(Number(pageNo));
    }
    @Get('getAllStaffByRole')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'get All Staffs By ROle' })
    @ApiResponse({ status: 200, description: 'get All Staffs with Role successfully.' })
    async getAllStaffByRole(@Query('pageNo') pageNo: string, @Query('role_id') role_id: number): Promise<any> {
        return this.adminService.getAllStaffByRole(Number(pageNo), role_id);
    }

    @Put('updateStaff')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Update staff data' })
    @ApiResponse({ status: 200, description: 'Update staff data successfully.' })
    async updateStaff(@Body() data: updateStaffDto): Promise<any> {
        return await this.adminService.adminUpdateStaff(data);
    }
    @Patch('setManager')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Update staff to Manager' })
    @ApiResponse({ status: 200, description: 'Update staff to Manager successfully.' })
    async setManager(@Body() data: setStaffToManagerDto): Promise<any> {
        return await this.adminService.adminsetManager(data);
    }
    @Post('createStaff')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'admin create staff' })
    @ApiResponse({ status: 200, description: 'admin create staff successfully.' })
    async createStaff(@Body() data: CreateStaffDto): Promise<any> {
        return await this.adminService.adminCreateStaff(data);
    }
}
