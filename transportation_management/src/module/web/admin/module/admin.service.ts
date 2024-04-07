import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountEntity } from 'src/entities/account.entity';
import { AddressEntity } from 'src/entities/address.entity';
import { CustomerEntity } from 'src/entities/customer.entity';
import { StaffEntity } from 'src/entities/staff.entity';
import { Repository, DataSource, Not, In } from 'typeorm';
import { updateStaffDto } from '../dto/staff-update.dto';
import { CreateStaffDto } from '../dto/staff-create.dto';
import { AuthenticationService } from 'src/module/core/authentication/modules/authentication.service';
import { RoleEntity } from 'src/entities/role.entity';
import { setStaffToManagerDto } from '../dto/staff-update-to-manager.dto';
import { PackageTypeEntity } from 'src/entities/package-type.entity';
import { UpdatePakageType } from '../dto/admin-package-type-update.dto';

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
        @InjectRepository(PackageTypeEntity)
        private packageTypeRepository: Repository<PackageTypeEntity>,
        private dataSource: DataSource,
        private configService: ConfigService,
        private authenticationService: AuthenticationService,
    ) {}
    async findAllAccount(pageNo: number, pageSize: number): Promise<any> {
        const [list, count] = await this.accountRepository
            .createQueryBuilder('account')
            .select(['account.accId', 'account.username', 'account.role', 'account.refresh_token'])
            .orderBy('account.accId', 'ASC')
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
    async getAllRoleStaff(): Promise<RoleEntity[]> {
        return this.roleRepository.find({ where: { roleId: Not(In([1, 4, 5])) } });
    }
    async getAllStaff(pageNo: number): Promise<any> {
        const pageSize = Number(this.configService.get<string>('PAGE_SIZE'));
        //const [list, count] = await this.staffRepository.findAndCount();
        const [list, count] = await this.staffRepository
            .createQueryBuilder('staff')
            .select([
                'staff.staffId',
                'staff.fullname',
                'staff.email',
                'staff.phone',
                'staff.warehouse',
                'staff.account',
                'staff.status',
                'warehouse.warehouseId',
                'account.accId',
                'role',
            ])
            .leftJoin('staff.warehouse', 'warehouse')
            .leftJoin('staff.account', 'account')
            .leftJoin('account.role', 'role')
            .where('role.role_id != :roleId', { roleId: 5 })
            .orderBy('warehouse.warehouseId', 'ASC')
            .addOrderBy('staff.staffId', 'ASC')
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
    async getAllStaffByRole(pageNo: number, roleId: number): Promise<any> {
        const pageSize = Number(this.configService.get<string>('PAGE_SIZE'));
        //const [list, count] = await this.staffRepository.findAndCount();
        const [list, count] = await this.staffRepository
            .createQueryBuilder('staff')
            .select([
                'staff.staffId',
                'staff.fullname',
                'staff.email',
                'staff.phone',
                'staff.warehouse',
                'staff.account',
                'staff.status',
                'warehouse.warehouseId',
                'account.accId',
                'role',
            ])
            .leftJoin('staff.warehouse', 'warehouse')
            .leftJoin('staff.account', 'account')
            .leftJoin('account.role', 'role')
            .where('role.role_id = :roleId', { roleId: roleId })
            .orderBy('warehouse.warehouseId', 'ASC')
            .addOrderBy('staff.staffId', 'ASC')
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
    async checkEmailIsEsit(email: string, staffId: number): Promise<boolean> {
        if (email == null) {
            return false;
        }
        const checkcus = await this.customerRepository.findOne({ where: { email: email } });
        let checkstaff = null;
        if (staffId === null) {
            checkstaff = await this.staffRepository.findOne({
                where: { email: email },
            });
        } else {
            checkstaff = await this.staffRepository.findOne({
                where: { email: email, staffId: Not(staffId) },
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
                staffId: data.staffId,
            },
        });
        if (!staff || staff.staffId === 1) {
            return { status: 404, msg: 'not found!' };
        }
        const checkemail = await this.checkEmailIsEsit(data.email, data.staffId);
        if (checkemail) {
            return { status: 404, msg: 'email is exist!' };
        }

        staff.fullname = data.fullname;
        staff.email = data.email;
        staff.phone = data.phone;
        staff.warehouseId = data.warehouseId ? data.warehouseId : staff.warehouseId;
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
        if (data.roleId === 1 || data.roleId === 5 || data.roleId === 4) {
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
            const accountId = accountInsertResult.accId;
            //create staff
            const staff = new StaffEntity();
            staff.accId = accountId;
            staff.fullname = data.fullName;
            staff.email = data.email;
            staff.phone = data.phone;
            staff.warehouseId = data.warehouseId;
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
                staffId: data.staffId,
            },
        });
        if (!staff || staff.staffId === 1) {
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
                .set({ roleId: 4 })
                .where('acc_id = :accId', { accId: staff.accId })
                .execute()
                .catch((error) => {
                    console.error('Error updating address:', error);
                    throw error;
                });
            //update staff
            staff.warehouseId = data.warehouseId;
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
    async getAllPackagetype() {
        return await this.packageTypeRepository.find();
    }
    async updatePageTypeById(data: UpdatePakageType) {
        const pkt = await this.packageTypeRepository.findOneBy({ pkId: data.pkId });
        pkt.pkName = data.pkName;
        pkt.pkPrice = data.pkPrice;
        await this.packageTypeRepository.save(pkt);
        return {
            status: 200,
            msg: 'update success',
        };
    }
}
