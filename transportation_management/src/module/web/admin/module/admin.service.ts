import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountEntity } from 'src/entities/account.entity';
import { AddressEntity } from 'src/entities/address.entity';
import { CustomerEntity } from 'src/entities/customer.entity';
import { WarehouseEntity } from 'src/entities/warehouse.entity';
import { Response } from 'src/module/response/Response';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(AccountEntity)
        private accountRepository: Repository<AccountEntity>,
        @InjectRepository(CustomerEntity)
        private customerRepository: Repository<CustomerEntity>,
        @InjectRepository(WarehouseEntity)
        private warehouseRepository: Repository<WarehouseEntity>,
        @InjectRepository(AddressEntity)
        private addressRepository: Repository<AddressEntity>,
        private dataSource: DataSource,
    ) {}
    async findAllAccount(pageNo: number, pageSize: number): Promise<any> {
        const [list, count] = await this.accountRepository
            .createQueryBuilder('account')
            .select(['account.acc_id', 'account.username', 'account.role', 'account.refresh_token'])
            .orderBy('account.acc_id', 'ASC')
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
    async getAllCustomer(pageNo: number, pageSize: number): Promise<any> {
        const [list, count] = await this.customerRepository
            .createQueryBuilder('customer')
            .select([
                'customer.cus_id',
                'customer.fullname',
                'customer.email',
                'customer.phone',
                'city.city_name',
                'district.district_name',
                'ward.ward_name',
            ])
            .leftJoin('customer.account', 'account')
            .leftJoin('customer.address', 'address')
            .leftJoin('address.city', 'city')
            .leftJoin('address.district', 'district')
            .leftJoin('address.ward', 'ward')
            .where('account.isActive = :isActive', { isActive: true })
            .orderBy('customer.cus_id', 'ASC')
            .skip((pageNo - 1) * pageSize)
            .take(pageSize)
            .getManyAndCount();
        const totalpage = Math.ceil(count % pageSize === 0 ? count / pageSize : Math.floor(count / pageSize) + 1);
        if (!count || totalpage < pageNo) {
            return new Response(200, 'not found', list);
        }
        return {
            list,
            count,
            pageNo,
            pageSize,
            totalpage,
        };
    }
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
    async getAllStaff(pageNo: number, role: string): Promise<any> {
        return pageNo + '' + role;
    }
}
