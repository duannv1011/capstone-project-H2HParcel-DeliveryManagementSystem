import { Body, Controller, Get, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/role.decorator';
import { Role } from 'src/enum/roles.enum';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { AdminService } from './admin.service';
import { CreateStaffDto } from '../dto/staff-create.dto';
import { updateStaffDto } from '../dto/staff-update.dto';
import { UpdatePakageType } from '../dto/admin-package-type-update.dto';
import { UpdateMutiplier } from '../dto/admin-mutiplier-update.dto';
import { UpdatePriceAndMutiplier } from '../dto/admin-update-price-mutiplier.dto';

@Controller('admin')
@ApiTags('SUPER ADMIN')
export class AdminController {
    constructor(
        private adminService: AdminService,
        private configService: ConfigService,
    ) {}

    @Get('admin/accounts')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'get All Account' })
    @ApiResponse({ status: 200, description: 'get All Account successfully.' })
    async getAllAccounts(@Query('pageNo') pageNo: string): Promise<any> {
        const pagesize = this.configService.get<string>('PAGE_SIZE');
        return this.adminService.findAllAccount(Number(pageNo), Number(pagesize));
    }
    @Get('admin/staff-roles')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'get All Role of Staff' })
    @ApiResponse({ status: 200, description: 'get All Role of Staff successfully.' })
    async getAllRoleStaff(): Promise<any> {
        return this.adminService.getAllRoleStaff();
    }

    @Get('admin/staffs')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'get All Staffs except Admin' })
    @ApiResponse({ status: 200, description: 'get All Staffs successfully.' })
    async getAllStaff(@Query('pageNo') pageNo: string): Promise<any> {
        return this.adminService.getAllStaff(Number(pageNo));
    }
    @Get('admin/staff/detail')
    @Roles(Role.ADMIN, Role.MANAGER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'get detail of Staff ' })
    @ApiResponse({ status: 200, description: 'get  Staff successfully.' })
    async getdDetailStaff(@Query('staffId') staffId: string): Promise<any> {
        return this.adminService.getdDetailStaff(Number(staffId));
    }
    @Get('admin/staffs/by-role')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'get All Staffs By Role' })
    @ApiResponse({ status: 200, description: 'get All Staffs with Role successfully.' })
    async getAllStaffByRole(@Query('pageNo') pageNo: string, @Query('role_id') role_id: number): Promise<any> {
        return this.adminService.getAllStaffByRole(Number(pageNo), role_id);
    }

    @Put('admin/update-staff')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Update staff data' })
    @ApiResponse({ status: 200, description: 'Update staff data successfully.' })
    async updateStaff(@Body() data: updateStaffDto): Promise<any> {
        return await this.adminService.adminUpdateStaff(data);
    }
    @Put('admin/staff/role-update')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Update staff role' })
    @ApiResponse({ status: 200, description: 'Update staff role data successfully.' })
    async updateRoleStaff(@Query('staffId') staffId: number, @Query('roleId') roleId: number): Promise<any> {
        return await this.adminService.updateRoleStaff(staffId, roleId);
    }
    @Post('admin/staff/change-manager')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Update staff to new manager of warehouse' })
    @ApiResponse({ status: 200, description: 'Update staff to manager  successfully.' })
    async changeManger(@Query('staffId') staffId: number, @Query('warehouseId') warehouseId: number): Promise<any> {
        console.log(staffId + 'and ' + warehouseId);
        return await this.adminService.changeManger(staffId, warehouseId);
    }
    @Post('admin/create-staff')
    @Roles(Role.ADMIN, Role.MANAGER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'admin create staff' })
    @ApiResponse({ status: 200, description: 'admin create staff successfully.' })
    async createStaff(@Body() data: CreateStaffDto): Promise<any> {
        return await this.adminService.adminCreateStaff(data);
    }
    @Get('admin/packages-type')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'admin get All packageType ' })
    @ApiResponse({ status: 200, description: 'get successfully.' })
    async getAllPackagetype(): Promise<any> {
        return await this.adminService.getAllPackagetype();
    }
    @Post('admin/packages-type/update')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'admin get All packageType ' })
    @ApiResponse({ status: 200, description: 'get successfully.' })
    async updatePageTypeById(@Body() data: UpdatePakageType): Promise<any> {
        return await this.adminService.updatePageTypeById(data);
    }
    @Get('admin/price-mutiplier')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'admin get All PriceMutiplier' })
    @ApiResponse({ status: 200, description: 'get successfully.' })
    async getAllPriceMutilplier(): Promise<any> {
        return await this.adminService.getAllPriceMutilplier();
    }
    @Post('admin/price-mutiplier/update')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'admin get All packageType ' })
    @ApiResponse({ status: 200, description: 'get successfully.' })
    async updatepriceMutiplier(@Body() data: UpdateMutiplier): Promise<any> {
        return await this.adminService.updatePriceMutilplier(data);
    }

    @Post('price-mutiplier/update')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'admin update All packageType and Mutiplier' })
    @ApiResponse({ status: 200, description: 'get successfully.' })
    async updatePriceAndMutiplier(@Body() data: UpdatePriceAndMutiplier): Promise<any> {
        return await this.adminService.updatePriceAndMutiplier(data);
    }
}
