import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ReportService } from './report.service';
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
    //
}
