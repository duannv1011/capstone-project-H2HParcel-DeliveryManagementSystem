import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ReportService } from './report.service';
import { AuthGuard } from '../../../guards/auth.guard';
import { Roles } from '../../../decorators/role.decorator';
import { Role } from '../../../enum/roles.enum';
import { RoleGuard } from '../../../guards/role.guard';
import { UserLogin } from 'src/decorators/user_login.decorator';
import { UserLoginData } from 'src/module/core/authentication/dto/user_login_data';

@ApiTags('report')
@Controller('report')
export class ReportController {
    constructor(private readonly reportService: ReportService) {}
    //admin report
    //addmin dash board
    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'get Admin report  dashboard  successfully' })
    @ApiOperation({ summary: 'Admin report  dashboard' })
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @Get('admin/dashboard')
    async reportDashboardAdmin() {
        return await this.reportService.reportDashboardAdmin();
    }
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

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'get Admin report revenue by area in month for table successfully' })
    @ApiOperation({ summary: 'get Admin report revenue by area in month for table' })
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @Get('admin/revenue/area-revenue/table')
    async reportAdminRevenueByDitrictInMotnhfortable(@Query('month') month: number, @Query('pageNo') pageNo: number) {
        return await this.reportService.reportAdminRevenueByDitrictInMotnhfortable(month, pageNo);
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
    @ApiOkResponse({ description: 'get Admin report customer for table successfully' })
    @ApiOperation({ summary: 'Admin report get all Customer in district for table' })
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @Get('admin/customer/customer-table')
    async reportCutomerAdminForTable(@Query('pageNo') pageNo: number, @Query('month') month: number) {
        return await this.reportService.reportCutomerAdminForTable(pageNo, month);
    }
    //report order for admin
    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'get report order successfully' })
    @ApiOperation({ summary: 'Admin report order by month' })
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @Get('admin/order/order-graph')
    async reportOrderAdminforGraph() {
        return await this.reportService.reportOrderAdminforGraph();
    }
    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'admin get all order by warehouse in month successfully' })
    @ApiOperation({ summary: 'admin get all order by warehouse in month' })
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @Get('admin/order/warehouse-order/table')
    async reportOrderByWarehoueInMotnhfortable(@Query('month') month: number, @Query('pageNo') pageNo: number) {
        return await this.reportService.reportOrderByWarehoueInMotnhfortable(month, pageNo);
    }
    //report staff for admin
    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'admin get staff report by warehouse in month successfully' })
    @ApiOperation({ summary: 'admin get staff report by warehouse in month' })
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @Get('admin/staff/table')
    async reportOrderStaffByWarehoueInMotnhfortable(@Query('month') month: number, @Query('pageNo') pageNo: number) {
        return await this.reportService.reportOrderStaffByWarehoueInMotnhfortable(month, pageNo);
    }
    //managerReport
    //dashboard
    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'manager get report dashboard successfully' })
    @ApiOperation({ summary: 'manager get report dashboard' })
    @Roles(Role.MANAGER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @Get('manager/dashboard')
    async reportDashboardForManager(@UserLogin() user: UserLoginData) {
        return await this.reportService.reportDashboardForManager(Number(user.accId));
    }
    //revanue for graph
    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'get manager report revenue  for graph successfully' })
    @ApiOperation({ summary: 'manager report revenue  for graph' })
    @Roles(Role.MANAGER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @Get('manager/revenue/revenue-graph')
    async reportRevenueManagerforGraph(@UserLogin() user: UserLoginData) {
        return await this.reportService.reportRevenueManagerforGraph(Number(user.accId));
    }
    //manager order for graph
    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'get manager report order  for graph successfully' })
    @ApiOperation({ summary: 'manager report order  for graph' })
    @Roles(Role.MANAGER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @Get('manager/order/order-graph')
    async reportOrderManagerforGraph(@UserLogin() user: UserLoginData) {
        return await this.reportService.reportOrderManagerforGraph(Number(user.accId));
    }
    ////manager order for table
    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'get manager report order  for table successfully' })
    @ApiOperation({ summary: 'manager report order  for table' })
    @Roles(Role.MANAGER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @Get('manager/order/order-table')
    async reportOrderManagerforTable(
        @UserLogin() user: UserLoginData,
        @Query('pageNo') pageNo: number,
        @Query('month') month: number,
    ) {
        return await this.reportService.reportOrderManagerforTable(Number(user.accId), pageNo, month);
    }
    //manager list all shiperr on warehouse
    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'get manager report staff  for table successfully' })
    @ApiOperation({ summary: 'manager report order  staff for table' })
    @Roles(Role.MANAGER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @Get('manager/staff/staff-table')
    async reportStaffManagerforTable(
        @UserLogin() user: UserLoginData,
        @Query('month') month: number,
        @Query('pageNo') pageNo: number,
    ) {
        return await this.reportService.reportStaffManagerforTable(Number(user.accId), month, pageNo);
    }
}
