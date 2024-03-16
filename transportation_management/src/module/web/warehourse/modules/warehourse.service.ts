import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddressEntity } from 'src/entities/address.entity';
import { WarehouseEntity } from 'src/entities/warehouse.entity';
import { Response } from 'src/module/response/Response';
import { DataSource, Repository } from 'typeorm';
import { updateActiveDto } from '../dto/changeActive_dto';

@Injectable()
export class WarehourseService {
    constructor(
        @InjectRepository(WarehouseEntity)
        private warehouseRepository: Repository<WarehouseEntity>,
        @InjectRepository(AddressEntity)
        private addressRepository: Repository<AddressEntity>,
        private dataSource: DataSource,
    ) {}
    async getAllWarehouse(pageNo: number, pageSize: number): Promise<any> {
        const [list, count] = await this.warehouseRepository
            .createQueryBuilder('warehouse')
            .select([
                'warehouse.warehouse_id',
                'warehouse.warehouse_name',
                'address.house',
                'city.city_name',
                'district.district_name',
                'ward.ward_name',
            ])
            .leftJoin('warehouse.address', 'address')
            .leftJoin('address.city', 'city')
            .leftJoin('address.district', 'district')
            .leftJoin('address.ward', 'ward')
            .where('warehouse.isActive = :isActive', { isActive: true })
            .orderBy('warehouse.warehouse_id', 'ASC')
            .skip((pageNo - 1) * pageSize)
            .take(pageSize)
            .getManyAndCount();
        return {
            list,
            count,
            pageNo,
            pageSize,
        };
    }
    async getDetailWarehouse(warehouse_id: number): Promise<any> {
        const wh = await this.warehouseRepository.findOneBy({ warehouse_id: warehouse_id });
        if (!wh) {
            return null;
        }
        const data = {
            warehouse_id: wh.warehouse_id,
            warehouse_name: wh.warehouse_name,
            house: wh.address.house,
            city: wh.address.city.city_name,
            district: wh.address.district.district_name,
            ward: wh.address.ward.ward_name,
        };
        return new Response(200, 'success', data);
    }
    async createWarehouse(data: any) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            //create Address
            const addressInsertResult = await queryRunner.manager
                .save(AddressEntity, {
                    house: data.hourse,
                    city_id: data.city_id,
                    district_id: data.district_id,
                    ward_id: data.ward_id,
                })
                .catch((error) => {
                    console.error('Error save address:', error);
                    throw error;
                });
            //create warehouse
            const warehouseInsertResult = await queryRunner.manager
                .save(WarehouseEntity, {
                    address_id: addressInsertResult.address_id,
                    warehouse_name: data.warehouse_name,
                    isActive: true,
                })
                .catch((error) => {
                    console.error('Error save warehouse:', error);
                    throw error;
                });
            await queryRunner.commitTransaction();
            return new Response(1, 'success', warehouseInsertResult);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            return error;
        } finally {
            await queryRunner.release();
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
                    house: data.hourse,
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
    async updateActive(data: updateActiveDto): Promise<any> {
        try {
            const wh = await this.warehouseRepository.findOne({ where: { warehouse_id: data.warehouse_id } });
            wh.isActive = !wh.isActive;
            await this.warehouseRepository.update(data.warehouse_id, wh);
            return { success: true, msg: 'updated successfully', status: HttpStatus.OK };
        } catch (error) {
            return { success: false, msg: 'updated fialed', status: HttpStatus.OK };
        }
    }
}
