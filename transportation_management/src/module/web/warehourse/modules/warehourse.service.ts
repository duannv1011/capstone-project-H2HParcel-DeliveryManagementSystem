import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddressEntity } from 'src/entities/address.entity';
import { WarehouseEntity } from 'src/entities/warehouse.entity';
import { Response } from 'src/module/response/Response';
import { DataSource, Repository } from 'typeorm';
import { updateActiveDto } from '../dto/changeActive_dto';
import { StaffEntity } from 'src/entities/staff.entity';

@Injectable()
export class WarehourseService {
    constructor(
        @InjectRepository(WarehouseEntity)
        private warehouseRepository: Repository<WarehouseEntity>,
        @InjectRepository(StaffEntity)
        private staffRepository: Repository<StaffEntity>,
        @InjectRepository(AddressEntity)
        private addressRepository: Repository<AddressEntity>,
        private dataSource: DataSource,
    ) {}
    async getAllWarehouse(pageNo: number, pageSize: number): Promise<any> {
        const [list, count] = await this.warehouseRepository
            .createQueryBuilder('wh')
            .select(['wh.warehouseId', 'wh.warehouse_name', 'a.house', 'c.city_name', 'd.district_name', 'w.ward_name'])
            .leftJoinAndSelect('wh.address', 'a')
            .leftJoinAndSelect('a.city', 'c')
            .leftJoinAndSelect('a.district', 'd')
            .leftJoinAndSelect('a.ward', 'w')
            .where('wh.isActive = :isActive', { isActive: true })
            .orderBy('wh.warehouseId', 'ASC')
            .skip((pageNo - 1) * pageSize)
            .take(pageSize)
            .getManyAndCount();
        const totalpage = Math.ceil(count % pageSize === 0 ? count / pageSize : Math.floor(count / pageSize) + 1);
        if (!count || totalpage < pageNo) {
            return { status: 404, msg: 'not found!' };
        }
        return {
            list,
            count,
            pageNo,
            pageSize,
            totalpage,
        };
    }
    async getAllWarehouseInstealStqaffWh(pageNo: number, pageSize: number, accid: number) {
        const staff = await this.staffRepository.findOneBy({ accId: accid });
        const warehouses = await this.warehouseRepository
            .createQueryBuilder('wh')
            .select(['wh.warehouseId', 'wh.warehouse_name', 'a.house', 'c.city_name', 'd.district_name', 'w.ward_name'])
            .leftJoinAndSelect('wh.address', 'a')
            .leftJoinAndSelect('a.city', 'c')
            .leftJoinAndSelect('a.district', 'd')
            .leftJoinAndSelect('a.ward', 'w')
            .where('wh.isActive = :isActive', { isActive: true })
            .where('wh.warehouse_id != :warehouseId', { warehouseId: staff.warehouseId })
            .orderBy('wh.warehouseId', 'ASC')
            .skip((pageNo - 1) * pageSize)
            .take(pageSize)
            .getManyAndCount();
        return warehouses ? warehouses : 'not found';
    }
    async getDetailWarehouse(warehouseId: number): Promise<any> {
        const wh = await this.warehouseRepository.findOneBy({ warehouseId: warehouseId });
        if (!wh) {
            return null;
        }
        const data = {
            warehouseId: wh.warehouseId,
            warehouseName: wh.warehouseName,
            house: wh.address.house,
            city: wh.address.city.cityName,
            district: wh.address.district.districtName,
            ward: wh.address.ward.wardName,
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
                    cityId: data.cityId,
                    districtId: data.districtId,
                    wardId: data.wardId,
                })
                .catch((error) => {
                    console.error('Error save address:', error);
                    throw error;
                });
            //create warehouse
            const warehouseInsertResult = await queryRunner.manager
                .save(WarehouseEntity, {
                    addressId: addressInsertResult.addressId,
                    warehouseName: data.warehouseName,
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
        const warehourse = await this.warehouseRepository.findOne({ where: { warehouseId: data.warehouseId } });
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // update address
            data.addressId = warehourse.addressId;
            await queryRunner.manager
                .createQueryBuilder()
                .update(AddressEntity)
                .set({
                    house: data.hourse,
                    cityId: data.cityId,
                    districtId: data.districtId,
                    wardId: data.wardId,
                })
                .where('address_id = :addressId', { addressId: data.addressId })
                .execute()
                .catch((error) => {
                    console.error('Error updating address:', error);
                    return error;
                });
            // update warehouse
            await queryRunner.manager
                .createQueryBuilder()
                .update(WarehouseEntity)
                .set({
                    warehouseName: data.warehouseName,
                })
                .where('warehouse_id = :warehouseId', { warehouseId: data.warehouseId })
                .execute()
                .catch((error) => {
                    console.error('Error updating warehouse:', error);
                    return error;
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
            const wh = await this.warehouseRepository.findOne({ where: { warehouseId: data.warehouseId } });
            wh.isActive = !wh.isActive;
            await this.warehouseRepository.update(data.warehouseId, wh);
            return { success: true, msg: 'updated successfully', status: HttpStatus.OK };
        } catch (error) {
            return { success: false, msg: 'updated fialed', status: HttpStatus.OK };
        }
    }
}
