import { Body, Controller, Get, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WarehourseService } from './warehourse.service';
import { UpdateWarehouseDto } from '../dto/updateWarehoue_dto';
import { CreateWarehouseDto } from '../dto/createWarehouse_dto';
import { updateActiveDto } from '../dto/changeActive_dto';
import { Roles } from 'src/decorators/role.decorator';
import { Role } from 'src/enum/roles.enum';
import { RoleGuard } from 'src/guards/role.guard';
import { AuthGuard } from 'src/guards/auth.guard';
import { ConfigService } from '@nestjs/config';
import { UserLogin } from 'src/decorators/user_login.decorator';
import { UserLoginData } from 'src/module/core/authentication/dto/user_login_data';

@Controller('warehourse')
@ApiTags('warehourse-crud-api')
export class WarehourseController {
    constructor(
        private readonly warehouseService: WarehourseService,
        private configService: ConfigService,
    ) {}
    @Get('getAllWarehouse')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'get All Warehouse' })
    @ApiResponse({ status: 200, description: 'get All Warehouse successfully.' })
    async getAllWarehouse(@Query('pageNo') pageNo: string): Promise<any> {
        const pagesize = this.configService.get<string>('PAGE_SIZE');
        return this.warehouseService.getAllWarehouse(Number(pageNo), Number(pagesize));
    }
    @Get('staff/warehouses')
    @Roles(Role.STAFF, Role.MANAGER, Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'get All Warehouse except staff warehouse' })
    @ApiResponse({ status: 200, description: 'get All Warehouse successfully.' })
    async getAllWarehouseInstealStqaffWh(@UserLogin() uer: UserLoginData): Promise<any> {
        return this.warehouseService.getAllWarehouseInstealStqaffWh(Number(uer.accId));
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
}
