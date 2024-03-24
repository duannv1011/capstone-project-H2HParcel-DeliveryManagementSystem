import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountEntity } from 'src/entities/account.entity';
import { AddressEntity } from 'src/entities/address.entity';
import { CustomerEntity } from 'src/entities/customer.entity';
import { StaffEntity } from 'src/entities/staff.entity';
import { StatusService } from 'src/module/core/status/service/status.service';
import { Response } from 'src/module/response/Response';
import { Repository, DataSource, Not, In } from 'typeorm';
import { updateStaffDto } from '../dto/staff-update.dto';
import { CreateStaffDto } from '../dto/staff-create.dto';
import { AuthenticationService } from 'src/module/core/authentication/modules/authentication.service';
import { RoleEntity } from 'src/entities/role.entity';
import { setStaffToManagerDto } from '../dto/staff-update-to-manager.dto';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(AccountEntity)
        private accountRepository: Repository<AccountEntity>,
        @InjectRepository(CustomerEntity)
        private customerRepository: Repository<CustomerEntity>,
        @InjectRepository(StaffEntity)
        private staffRepository: Repository<StaffEntity>,
        @InjectRepository(AddressEntity)
        private addressRepository: Repository<AddressEntity>,
        @InjectRepository(RoleEntity)
        private roleRepository: Repository<RoleEntity>,
        private dataSource: DataSource,
        private configService: ConfigService,
        private statusService: StatusService,
        private authenticationService: AuthenticationService,
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
    async getAllRoleStaff(): Promise<RoleEntity[]> {
        return this.roleRepository.find({ where: { role_id: Not(In([1, 4, 5])) } });
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
    async checkEmailIsEsit(email: string, staff_id: number): Promise<boolean> {
        if (email == null) {
            return false;
        }
        const checkcus = await this.customerRepository.findOne({ where: { email: email } });
        let checkstaff = null;
        if (staff_id === null) {
            checkstaff = await this.staffRepository.findOne({
                where: { email: email },
            });
        } else {
            checkstaff = await this.staffRepository.findOne({
                where: { email: email, staff_id: Not(staff_id) },
            });
        }

        if (checkcus || checkstaff) {
            return true;
        }
        return false;
    }
    async adminUpdateStaff(data: updateStaffDto): Promise<any> {
        const staff = await this.staffRepository.findOne({
            where: {
                staff_id: data.staff_id,
            },
        });
        if (!staff || staff.staff_id === 1) {
            return { status: 404, msg: 'not found!' };
        }
        const checkemail = await this.checkEmailIsEsit(data.email, data.staff_id);
        if (checkemail) {
            return { status: 404, msg: 'email is exist!' };
        }

        staff.fullname = data.fullname;
        staff.email = data.email;
        staff.phone = data.phone;
        staff.warehouse_id = data.warehouse_id ? data.warehouse_id : staff.warehouse_id;
        staff.status = data.status ? data.status : staff.status;
        await this.staffRepository.save(staff);
        return {
            status: 200,
            msg: 'update success',
        };
    }
    async adminCreateStaff(data: CreateStaffDto): Promise<any> {
        //database logic checked
        const checkexistingUsername = await this.accountRepository.findOne({
            where: { username: data.username },
        });
        if (checkexistingUsername) {
            return { status: 409, msg: 'username is exist!' };
        }
        const checkemail = await this.checkEmailIsEsit(data.email, null);
        if (checkemail) {
            return { status: 409, msg: 'email is exist!' };
        }
        if (data.role_id === 1 || data.role_id === 5 || data.role_id === 4) {
            return { status: 409, msg: 'Role not  ilegal' };
        }
        const hashedPassword = await this.authenticationService.hashpassword(data.password);
        data.password = hashedPassword;
        //start create
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // craete Account
            const accountInsertResult = await queryRunner.manager.save(AccountEntity, {
                ...data,
                refresh_token: 'refresh_token_string',
                password: hashedPassword,
            });
            const accountId = accountInsertResult.acc_id;
            //create staff
            const staff = new StaffEntity();
            staff.acc_id = accountId;
            staff.fullname = data.fullname;
            staff.email = data.email;
            staff.phone = data.phone;
            staff.warehouse_id = data.warehouse_id;
            staff.status = 1;
            await await queryRunner.manager.save(staff);
            await queryRunner.commitTransaction();
            return {
                status: 200,
                msg: 'create success',
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            return error;
        } finally {
            await queryRunner.release();
        }
    }
    async adminsetManager(data: setStaffToManagerDto): Promise<any> {
        const staff = await this.staffRepository.findOne({
            where: {
                staff_id: data.staff_id,
            },
        });
        if (!staff || staff.staff_id === 1) {
            return { status: 404, msg: 'not found!' };
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            //update Account
            await queryRunner.manager
                .createQueryBuilder()
                .update(AccountEntity)
                .set({ role_id: 4 })
                .where('acc_id = :acc_id', { acc_id: staff.acc_id })
                .execute()
                .catch((error) => {
                    console.error('Error updating address:', error);
                    throw error;
                });
            //update staff
            staff.warehouse_id = data.warehouse_id;
            await queryRunner.manager.save(staff);
            await queryRunner.commitTransaction();
            return {
                status: 200,
                msg: 'update success',
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            return error;
        } finally {
            await queryRunner.release();
        }
    }
}
