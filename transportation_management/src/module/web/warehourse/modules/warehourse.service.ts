import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddressEntity } from 'src/entities/address.entity';
import { WarehouseEntity } from 'src/entities/warehouse.entity';
import { Response } from 'src/module/response/Response';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class WarehourseService {
    constructor(
        @InjectRepository(WarehouseEntity)
        private warehouseRepository: Repository<WarehouseEntity>,
        @InjectRepository(AddressEntity)
        private addressRepository: Repository<AddressEntity>,
        private dataSource: DataSource,
    ) {}
    async getAllWarehouse(): Promise<[WarehouseEntity[], number]> {
        return this.warehouseRepository.findAndCount();
    }
    async getDetailWarehouse(warehouse_id: number): Promise<WarehouseEntity> {
        return this.warehouseRepository.findOneBy({ warehouse_id: warehouse_id });
    }
    async createWarehouse(data: any) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            //create Address
            const addressInsertResult = await queryRunner.manager.save(AddressEntity, {
                house: data.address_id,
                city_id: data.city_id,
                district_id: data.district_id,
                ward_id: data.ward_id,
            });
            //create warehouse
            const warehouseInsertResult = await queryRunner.manager.save(WarehouseEntity, {
                address_id: addressInsertResult.address_id,
                warehouse_name: data.warehouse_name,
            });
            await queryRunner.commitTransaction();
            return new Response(1, 'success', warehouseInsertResult);
        } catch (error) {
            throw new HttpException(error, HttpStatus.BAD_REQUEST);
        }
    }

    async updateWarehouse(data: any) {
        const warehourse = await this.warehouseRepository.findOne({ where: { warehouse_id: data.warehouse_id } });
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // update address
            data.address_id = warehourse.address_id;
            await queryRunner.manager
                .createQueryBuilder()
                .update(AddressEntity)
                .set({
                    house: data.address_id,
                    city_id: data.city_id,
                    district_id: data.district_id,
                    ward_id: data.ward_id,
                })
                .where('address_id = :address_id', { address_id: data.address_id })
                .execute()
                .catch((error) => {
                    console.error('Error updating address:', error);
                    throw error;
                });
            // update warehouse
            await queryRunner.manager
                .createQueryBuilder()
                .update(WarehouseEntity)
                .set({
                    warehouse_name: data.warehouse_name,
                })
                .where('warehouse_id = :warehouse_id', { warehouse_id: data.warehouse_id })
                .execute()
                .catch((error) => {
                    console.error('Error updating warehouse:', error);
                    throw error;
                });
            await queryRunner.commitTransaction();
            return { success: true, msg: 'updated successfully', status: HttpStatus.OK };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            return error;
        } finally {
            await queryRunner.release();
        }
    }
}
