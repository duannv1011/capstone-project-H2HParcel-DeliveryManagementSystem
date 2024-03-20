import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountEntity } from 'src/entities/account.entity';
import { AddressEntity } from 'src/entities/address.entity';
import { CustomerEntity } from 'src/entities/customer.entity';
import { StaffEntity } from 'src/entities/staff.entity';
import { WarehouseEntity } from 'src/entities/warehouse.entity';
import { StatusService } from 'src/module/core/status/service/status.service';
import { Response } from 'src/module/response/Response';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(AccountEntity)
        private accountRepository: Repository<AccountEntity>,
        @InjectRepository(CustomerEntity)
        private customerRepository: Repository<CustomerEntity>,
        @InjectRepository(StaffEntity)
        private staffRepository: Repository<StaffEntity>,
        @InjectRepository(WarehouseEntity)
        private warehouseRepository: Repository<WarehouseEntity>,
        @InjectRepository(AddressEntity)
        private addressRepository: Repository<AddressEntity>,
        private dataSource: DataSource,
        private configService: ConfigService,
        private statusService: StatusService,
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
                'customer.status',
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
    async getAllStaff(pageNo: number): Promise<any> {
        const pageSize = Number(this.configService.get<string>('PAGE_SIZE'));
        //const [list, count] = await this.staffRepository.findAndCount();
        const [list, count] = await this.staffRepository
            .createQueryBuilder('staff')
            .select([
                'staff.staff_id',
                'staff.fullname',
                'staff.email',
                'staff.phone',
                'staff.warehouse',
                'staff.account',
                'staff.status',
                'warehouse.warehouse_id',
                'account.acc_id',
                'role',
            ])
            .leftJoin('staff.warehouse', 'warehouse')
            .leftJoin('staff.account', 'account')
            .leftJoin('account.role', 'role')
            .where('role.role_id != :role_id', { role_id: 5 })
            .orderBy('warehouse.warehouse_id', 'ASC')
            .addOrderBy('staff.staff_id', 'ASC')
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
    async getAllStaffByRole(pageNo: number, role_id: number): Promise<any> {
        const pageSize = Number(this.configService.get<string>('PAGE_SIZE'));
        //const [list, count] = await this.staffRepository.findAndCount();
        const [list, count] = await this.staffRepository
            .createQueryBuilder('staff')
            .select([
                'staff.staff_id',
                'staff.fullname',
                'staff.email',
                'staff.phone',
                'staff.warehouse',
                'staff.account',
                'staff.status',
                'warehouse.warehouse_id',
                'account.acc_id',
                'role',
            ])
            .leftJoin('staff.warehouse', 'warehouse')
            .leftJoin('staff.account', 'account')
            .leftJoin('account.role', 'role')
            .where('role.role_id = :role_id', { role_id: role_id })
            .orderBy('warehouse.warehouse_id', 'ASC')
            .addOrderBy('staff.staff_id', 'ASC')
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
}
