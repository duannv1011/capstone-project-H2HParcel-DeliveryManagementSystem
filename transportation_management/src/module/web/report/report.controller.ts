import { Controller, Get, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ReportService } from './report.service';
import { Response } from '../../response/Response';
import { UserLogin } from '../../../decorators/user_login.decorator';
import { UserLoginData } from '../../core/authentication/dto/user_login_data';
import { AuthGuard } from '../../../guards/auth.guard';
import { Roles } from '../../../decorators/role.decorator';
import { Role } from '../../../enum/roles.enum';
import { RoleGuard } from '../../../guards/role.guard';

@ApiTags('report')
@Controller('report')
export class ReportController {
    constructor(private readonly reportService: ReportService) {}
    //report revenue for admin
    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'get Admin report revenue dashboard for graph successfully' })
    @ApiOperation({ summary: 'Admin report revenue dashboard for graph' })
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @Get('admin/revenue/revenue-graph')
    async reportRevenueAdminforGraph() {
        return await this.reportService.reportRevenueAdminforGraph();
    }
    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'get Admin report revenue by warehouse in month for table successfully' })
    @ApiOperation({ summary: 'get Admin report revenue by warehouse in month for table' })
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @Get('admin/revenue/warehouse-revenue/table')
    async reportAdminRevenueByWarehoueInMotnhfortable(@Query('month') month: number, @Query('pageNo') pageNo: number) {
        return await this.reportService.reportAdminRevenueByWarehoueInMotnhfortable(month, pageNo);
    }
    //report customer for admin
    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'get Admin report customer for graph successfully' })
    @ApiOperation({ summary: 'Admin report get all Customer in month for graph' })
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @Get('admin/customer/customer-graph')
    async reportCutomerAdminForGraph() {
        return await this.reportService.reportCutomerAdminForGraph();
    }
    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'get Admin report customer for graph successfully' })
    @ApiOperation({ summary: 'Admin report get all Customer in month for graph' })
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @Get('admin/customer/customer-table')
    async reportCutomerAdminForTable() {
        return await this.reportService.reportCutomerAdminForTable();
    }
    //
    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'Admin report staff detail' })
    @ApiOperation({ summary: 'Admin report staff detail' })
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @Get('admin/staff/detail')
    async reportAdminStaffDetail(@Query('pageNo', ParseIntPipe) pageNo: number): Promise<Response> {
        const report = await this.reportService.getReportAdminStaffDetail(pageNo);
        return new Response(200, 'success', report.reports, report.paging, 1);
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'Admin report order detail' })
    @ApiOperation({ summary: 'Admin report order detail' })
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @Get('admin/order/detail')
    async reportAdminOrderDetail(@Query('pageNo', ParseIntPipe) pageNo: number): Promise<Response> {
        const report = await this.reportService.getReportAdminOrderDetail(pageNo);
        return new Response(200, 'success', report.report, report.paging, 1);
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'Admin report customer detail' })
    @ApiOperation({ summary: 'Admin report customer detail' })
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @Get('admin/customer/detail')
    async reportAdminCustomerDetail(@Query('pageNo', ParseIntPipe) pageNo: number): Promise<Response> {
        const report = await this.reportService.getReportAdminCustomerDetail(pageNo);
        return new Response(200, 'success', report.report, report.paging, 1);
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'Admin report warehouse detail' })
    @ApiOperation({ summary: 'Admin report warehouse detail' })
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @Get('admin/warehouse/detail')
    async reportAdminWarehouseDetail(@Query('pageNo', ParseIntPipe) pageNo: number): Promise<Response> {
        const report = await this.reportService.getReportAdminWarehouseDetail(pageNo);
        return new Response(200, 'success', report.report, report.paging, 1);
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'Admin report area detail' })
    @ApiOperation({ summary: 'Admin report area detail' })
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @Get('admin/area/detail')
    async reportAdminAreaDetail(@Query('pageNo', ParseIntPipe) pageNo: number): Promise<Response> {
        const report = await this.reportService.getReportAdminAreaDetail(pageNo);
        return new Response(200, 'success', report.report, report.paging, 1);
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'Manager report order detail' })
    @ApiOperation({ summary: 'Manager report order detail' })
    @Roles(Role.MANAGER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @Get('manager/order/detail')
    async reportManagerOrderDetail(
        @UserLogin() userLogin: UserLoginData,
        @Query('pageNo', ParseIntPipe) pageNo: number,
    ): Promise<Response> {
        const report = await this.reportService.getReportManagerOrderDetail(userLogin, pageNo);
        return new Response(200, 'success', report.report, report.paging, 1);
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'Manager report staff detail' })
    @ApiOperation({ summary: 'Manager report staff detail' })
    @Roles(Role.MANAGER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @Get('manager/staff/detail')
    async reportManagerStaffDetail(
        @UserLogin() userLogin: UserLoginData,
        @Query('pageNo', ParseIntPipe) pageNo: number,
    ): Promise<Response> {
        const report = await this.reportService.getReportManagerStaffDetail(userLogin, pageNo);
        return new Response(200, 'success', report.reports, report.paging, 1);
    }
}
