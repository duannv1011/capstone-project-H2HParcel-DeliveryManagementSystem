import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { StaffEntity } from 'src/entities/staff.entity';
import { Not, Repository } from 'typeorm';
import { updateStaffDto } from '../../admin/dto/staff-update.dto';
import { CustomerEntity } from 'src/entities/customer.entity';

@Injectable()
export class ManagercrudService {
    constructor(
        private configService: ConfigService,
        @InjectRepository(StaffEntity)
        private staffRepository: Repository<StaffEntity>,
        @InjectRepository(CustomerEntity)
        private customerRepository: Repository<CustomerEntity>,
    ) {}
    async getAllStaff(pageNo: number, accId: number): Promise<any> {
        const getwarehoue = await this.staffRepository.findOneBy({ accId });
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
            .andWhere('staff.warehouse_id = :warehouseId', { warehouseId: getwarehoue.warehouseId })
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
    async adminUpdateStaff(data: updateStaffDto, accId: number): Promise<any> {
        const getwarehoue = await this.staffRepository.findOneBy({ accId });
        const staff = await this.staffRepository
            .createQueryBuilder('staff')
            .where('staff.staff_id = :staffId', { staffId: data.staffId })
            .andWhere('staff.warehouseId = :warehouseId', { warehouseId: getwarehoue.warehouseId })
            .getOne();
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
    async getAllStaffByRole(pageNo: number, roleId: number, accId: number): Promise<any> {
        const getwarehoue = await this.staffRepository.findOneBy({ accId });
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
            .andWhere('staff.warehouse_id = :warehouseId', { warehouseId: getwarehoue.warehouseId })
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
