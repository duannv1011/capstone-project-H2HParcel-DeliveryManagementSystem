import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/role.decorator';
import { Role } from 'src/enum/roles.enum';
import { RoleGuard } from 'src/guards/role.guard';
import { updateStaffDto } from '../../admin/dto/staff-update.dto';
import { ManagercrudService } from './managercrud.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { UserLogin } from 'src/decorators/user_login.decorator';
import { UserLoginData } from 'src/module/core/authentication/modules/user_login_data';

@Controller('managercrud')
@ApiTags('managercrud-api')
export class ManagercrudController {
    constructor(private readonly managercrudService: ManagercrudService) {}
    @Get('getAllStaff')
    @Roles(Role.MANAGER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'get All Staffs except Admin in Warehouse' })
    @ApiResponse({ status: 200, description: 'get All Staffs successfully.' })
    async getAllStaff(@Query('pageNo') pageNo: string, @UserLogin() userLogin: UserLoginData): Promise<any> {
        return this.managercrudService.getAllStaff(Number(pageNo), Number(userLogin.accId));
    }
    @Get('getAllStaffByRole')
    @Roles(Role.MANAGER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'get All Staffs By ROle in Warehouse' })
    @ApiResponse({ status: 200, description: 'get All Staffs with Role successfully.' })
    async getAllStaffByRole(
        @Query('pageNo') pageNo: string,
        @Query('role_id') role_id: number,
        @UserLogin() userLogin: UserLoginData,
    ): Promise<any> {
        return this.managercrudService.getAllStaffByRole(Number(pageNo), role_id, Number(userLogin.accId));
    }

    @Put('updateStaff')
    @Roles(Role.MANAGER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Update staff data in Warehouse' })
    @ApiResponse({ status: 200, description: 'Update staff data successfully.' })
    async updateStaff(@Body() data: updateStaffDto, @UserLogin() userLogin: UserLoginData): Promise<any> {
        return await this.managercrudService.adminUpdateStaff(data, Number(userLogin.accId));
    }
}
