import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddressEntity } from 'src/entities/address.entity';
import { WarehouseEntity } from 'src/entities/warehouse.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WarehourseService {
    constructor(
        @InjectRepository(WarehouseEntity)
        private warehouseRepository: Repository<WarehouseEntity>,
        @InjectRepository(AddressEntity)
        private addressRepository: Repository<AddressEntity>,
    ) {}
    async getAllWarehouse(): Promise<[WarehouseEntity[], number]> {
        return this.warehouseRepository.findAndCount();
    }
    async getDetailWarehouse(warehouse_id: number): Promise<WarehouseEntity> {
        return this.warehouseRepository.findOneBy({ warehouse_id: warehouse_id });
    }
    async createWarehouse(data: any) {
        try {
            return await this.warehouseRepository.save(data);
        } catch (error) {
            throw new HttpException(error, HttpStatus.BAD_REQUEST);
        }
    }

    async updateWarehouse(data: any) {
        try {
            return await this.warehouseRepository.update(data.id, data);
        } catch (error) {
            throw new HttpException(error, HttpStatus.BAD_REQUEST);
        }
    }
}
