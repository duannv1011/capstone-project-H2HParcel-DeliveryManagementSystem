import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WarehourseService } from './warehourse.service';
import { UpdateWarehouseDto } from '../dto/updateWarehoue_dto';

@Controller('warehourse')
@ApiTags('warehourse-crud-api')
export class WarehourseController {
    constructor(private readonly warehouseService: WarehourseService) {}
    @Get('getAllWarehouse')
    async getAllWarehouse(): Promise<any> {
        return this.warehouseService.getAllWarehouse();
    }
    @Get('getDetailWarehouse:id')
    async getDetailWarehouse(@Param() warehouse_id: string): Promise<any> {
        return this.warehouseService.getDetailWarehouse(Number(warehouse_id));
    }
    @Post('createWarehouse')
    async createWarehouse(@Body() data: any): Promise<any> {
        return this.warehouseService.createWarehouse(data);
    }
    @Put('updateWarehouse')
    async updateWarehouse(@Body() data: UpdateWarehouseDto): Promise<any> {
        return this.warehouseService.updateWarehouse(data);
    }
}
