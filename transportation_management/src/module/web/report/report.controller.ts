import { Controller, Get, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ReportService } from './report.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { Response } from '../../response/Response';
import { UserLogin } from '../../../decorators/user_login.decorator';
import { UserLoginData } from '../../core/authentication/dto/user_login_data';
import { RoleGuard } from '../../../guards/role.guard';
import { Roles } from '../../../decorators/role.decorator';
import { Role } from '../../../enum/roles.enum';

@ApiTags('report')
@Controller('report')
export class ReportController {
    constructor(private readonly reportService: ReportService) {}

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'Admin report dashboard' })
    @ApiOperation({ summary: 'Admin report dashboard' })
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @ApiQuery({ name: 'from', required: false, type: String })
    @ApiQuery({ name: 'to', required: false, type: String })
    @Get('admin/dashboard')
    async reportAdmin(@Query('from') from?: string, @Query('to') to?: string): Promise<Response> {
        const report = await this.reportService.getReportAdmin(from, to);
        return new Response(200, 'success', report, null, 1);
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'Admin report staff detail' })
    @ApiOperation({ summary: 'Admin report staff detail' })
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @ApiQuery({ name: 'from', required: false, type: String })
    @ApiQuery({ name: 'to', required: false, type: String })
    @Get('admin/staff/detail')
    async reportAdminStaffDetail(
        @Query('pageNo', ParseIntPipe) pageNo: number,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ): Promise<Response> {
        const report = await this.reportService.getReportAdminStaffDetail(pageNo, from, to);
        return new Response(200, 'success', report.reports, report.paging, 1);
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'Admin report order detail' })
    @ApiOperation({ summary: 'Admin report order detail' })
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @UseGuards(AuthGuard)
    @ApiQuery({ name: 'from', required: false, type: String })
    @ApiQuery({ name: 'to', required: false, type: String })
    @ApiUnauthorizedResponse()
    @Get('admin/order/detail')
    async reportAdminOrderDetail(
        @Query('pageNo', ParseIntPipe) pageNo: number,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ): Promise<Response> {
        const report = await this.reportService.getReportAdminOrderDetail(pageNo, from, to);
        return new Response(200, 'success', report.report, report.paging, 1);
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'Admin report customer detail' })
    @ApiOperation({ summary: 'Admin report customer detail' })
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @ApiQuery({ name: 'from', required: false, type: String })
    @ApiQuery({ name: 'to', required: false, type: String })
    @Get('admin/customer/detail')
    async reportAdminCustomerDetail(
        @Query('pageNo', ParseIntPipe) pageNo: number,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ): Promise<Response> {
        const report = await this.reportService.getReportAdminCustomerDetail(pageNo, from, to);
        return new Response(200, 'success', report.report, report.paging, 1);
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'Admin report warehouse detail' })
    @ApiOperation({ summary: 'Admin report warehouse detail' })
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @ApiQuery({ name: 'from', required: false, type: String })
    @ApiQuery({ name: 'to', required: false, type: String })
    @Get('admin/warehouse/detail')
    async reportAdminWarehouseDetail(
        @Query('pageNo', ParseIntPipe) pageNo: number,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ): Promise<Response> {
        const report = await this.reportService.getReportAdminWarehouseDetail(pageNo, from, to);
        return new Response(200, 'success', report.report, report.paging, 1);
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'Admin report area detail' })
    @ApiOperation({ summary: 'Admin report area detail' })
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @ApiQuery({ name: 'from', required: false, type: String })
    @ApiQuery({ name: 'to', required: false, type: String })
    @Get('admin/area/detail')
    async reportAdminAreaDetail(
        @Query('pageNo', ParseIntPipe) pageNo: number,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ): Promise<Response> {
        const report = await this.reportService.getReportAdminAreaDetail(pageNo, from, to);
        return new Response(200, 'success', report.report, report.paging, 1);
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'Manager report dashboard' })
    @ApiOperation({ summary: 'Manager report dashboard' })
    @Roles(Role.MANAGER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @ApiQuery({ name: 'from', required: false, type: String })
    @ApiQuery({ name: 'to', required: false, type: String })
    @Get('manager/dashboard')
    async reportManager(
        @UserLogin() userLogin: UserLoginData,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ): Promise<Response> {
        const report = await this.reportService.getReportManager(userLogin, from, to);
        return new Response(200, 'success', report, null, 1);
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'Manager report order detail' })
    @ApiOperation({ summary: 'Manager report order detail' })
    @Roles(Role.MANAGER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @ApiQuery({ name: 'from', required: false, type: String })
    @ApiQuery({ name: 'to', required: false, type: String })
    @Get('manager/order/detail')
    async reportManagerOrderDetail(
        @UserLogin() userLogin: UserLoginData,
        @Query('pageNo', ParseIntPipe) pageNo: number,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ): Promise<Response> {
        const report = await this.reportService.getReportManagerOrderDetail(userLogin, pageNo, from, to);
        return new Response(200, 'success', report.report, report.paging, 1);
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'Manager report staff detail' })
    @ApiOperation({ summary: 'Manager report staff detail' })
    @Roles(Role.MANAGER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @ApiQuery({ name: 'from', required: false, type: String })
    @ApiQuery({ name: 'to', required: false, type: String })
    @Get('manager/staff/detail')
    async reportManagerStaffDetail(
        @UserLogin() userLogin: UserLoginData,
        @Query('pageNo', ParseIntPipe) pageNo: number,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ): Promise<Response> {
        const report = await this.reportService.getReportManagerStaffDetail(userLogin, pageNo, from, to);
        return new Response(200, 'success', report.reports, report.paging, 1);
    }
}
