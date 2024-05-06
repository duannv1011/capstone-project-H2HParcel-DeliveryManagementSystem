import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { StaffEntity } from 'src/entities/staff.entity';
import { Not, Repository } from 'typeorm';
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
        const manager = await this.staffRepository.findOneBy({ accId });
        const pageSize = Number(this.configService.get<string>('PAGE_SIZE'));
        const [list, count] = await this.staffRepository
            .createQueryBuilder('s')
            .leftJoin('s.account', 'account')
            .where('s.warehouse_id = :warehouseId', { warehouseId: manager.warehouseId })
            .andWhere('account.role_id  != 5')
            .andWhere('account.role_id  != 4')
            .orderBy('s.staffId', 'ASC')
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
    async getAllStaffByRole(pageNo: number, roleId: number, accId: number): Promise<any> {
        const manager = await this.staffRepository.findOneBy({ accId });
        const pageSize = Number(this.configService.get<string>('PAGE_SIZE'));
        const [list, count] = await this.staffRepository
            .createQueryBuilder('s')
            .leftJoin('s.account', 'account')
            .where('s.warehouse_id = :warehouseId', { warehouseId: manager.warehouseId })
            .andWhere('account.role_id  != 5')
            .andWhere('account.role_id  = :roleId', { roleId: roleId })
            .orderBy('s.staffId', 'ASC')
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
