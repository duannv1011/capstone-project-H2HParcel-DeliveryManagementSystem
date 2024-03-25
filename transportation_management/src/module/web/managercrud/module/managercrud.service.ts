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
    async getAllStaff(pageNo: number, acc_id: number): Promise<any> {
        const getwarehoue = await this.staffRepository.findOneBy({ acc_id });
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
            .andWhere('staff.warehouse_id = :warehouse_id', { warehouse_id: getwarehoue.warehouse_id })
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
    async adminUpdateStaff(data: updateStaffDto, acc_id: number): Promise<any> {
        const getwarehoue = await this.staffRepository.findOneBy({ acc_id });
        const staff = await this.staffRepository
            .createQueryBuilder('staff')
            .where('staff.staff_id = :staffId', { staffId: data.staff_id })
            .andWhere('staff.warehouse_id = :warehouseId', { warehouseId: getwarehoue.warehouse_id })
            .getOne();
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
    async getAllStaffByRole(pageNo: number, role_id: number, acc_id: number): Promise<any> {
        const getwarehoue = await this.staffRepository.findOneBy({ acc_id });
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
            .andWhere('staff.warehouse_id = :warehouse_id', { warehouse_id: getwarehoue.warehouse_id })
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
