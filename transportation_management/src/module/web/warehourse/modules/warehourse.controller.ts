import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WarehourseService } from './warehourse.service';
import { UpdateWarehouseDto } from '../dto/updateWarehoue_dto';
import { CreateWarehouseDto } from '../dto/createWarehouse_dto';
import { updateActiveDto } from '../dto/changeActive_dto';
import { Roles } from 'src/decorators/role.decorator';
import { Role } from 'src/enum/roles.enum';
import { RoleGuard } from 'src/guards/role.guard';
import { AuthGuard } from 'src/guards/auth.guard';
import { ConfigService } from '@nestjs/config';

@Controller('warehourse')
@ApiTags('warehourse-crud-api')
export class WarehourseController {
    constructor(
        private readonly warehouseService: WarehourseService,
        private configService: ConfigService,
    ) {}
    @Get('getDetailWarehouse:warehouse_id')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    async getDetailWarehouse(@Param('warehouse_id') warehouse_id: string): Promise<any> {
        return this.warehouseService.getDetailWarehouse(Number(warehouse_id));
    }
    @Post('createWarehouse')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    async createWarehouse(@Body() data: CreateWarehouseDto): Promise<any> {
        return this.warehouseService.createWarehouse(data);
    }
    @Put('updateWarehouse')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    async updateWarehouse(@Body() data: UpdateWarehouseDto): Promise<any> {
        return this.warehouseService.updateWarehouse(data);
    }
    @Put('changeActiveWarehouse')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    async changeActiveWarehouse(@Body() data: updateActiveDto): Promise<any> {
        return this.warehouseService.updateActive(data);
    }
}
