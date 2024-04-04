import { Body, Controller, Get, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/role.decorator';
import { Role } from 'src/enum/roles.enum';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { AdminService } from './admin.service';
import { CreateStaffDto } from '../dto/staff-create.dto';
import { updateStaffDto } from '../dto/staff-update.dto';
import { setStaffToManagerDto } from '../dto/staff-update-to-manager.dto';

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
    @Patch('admin/staff/setManager')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Update staff to Manager' })
    @ApiResponse({ status: 200, description: 'Update staff to Manager successfully.' })
    async setManager(@Body() data: setStaffToManagerDto): Promise<any> {
        return await this.adminService.adminsetManager(data);
    }
    @Post('admin/create-staff')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'admin create staff' })
    @ApiResponse({ status: 200, description: 'admin create staff successfully.' })
    async createStaff(@Body() data: CreateStaffDto): Promise<any> {
        return await this.adminService.adminCreateStaff(data);
    }
}
