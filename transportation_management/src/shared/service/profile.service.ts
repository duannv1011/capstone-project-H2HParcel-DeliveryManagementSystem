import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountEntity } from '../../entities/account.entity';
import { RoleEntity } from '../../entities/role.entity';
import { StaffEntity } from '../../entities/staff.entity';
import { StaffProfileUpdateDto } from '../dto/profile/staff_profile.update.dto';

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(AccountEntity)
        private accountRepository: Repository<AccountEntity>,
        @InjectRepository(RoleEntity)
        private roleRepository: Repository<RoleEntity>,
        @InjectRepository(StaffEntity)
        private staffRepository: Repository<StaffEntity>,
    ) {}

    /**
     * Get profiles of Staff by accId.
     *
     * @param accId accId from user login is staff.
     * @return Promise<AccountEntity>
     */
    async findOneStaffByAccId(accId: number): Promise<AccountEntity> {
        try {
            return await this.accountRepository
                .createQueryBuilder('account')
                .innerJoinAndSelect('account.staffs', 'staffs')
                .where({ acc_id: accId })
                .getOne();
        } catch (error) {
            Logger.error(error);
            throw new InternalServerErrorException();
        }
    }

    /**
     * Get all profiles by accId.
     *
     * @param accId accId from user login is manager.
     * @return Promise<AccountEntity>
     */
    async findOneProfileByAccId(accId: number): Promise<AccountEntity> {
        // TODO: join shipper
        try {
            return await this.accountRepository
                .createQueryBuilder('account')
                .innerJoinAndSelect('account.staffs', 'staffs')
                .innerJoinAndSelect('account.customers', 'customers')
                .where({ acc_id: accId })
                .getOne();
        } catch (error) {
            Logger.error(error);
            throw new InternalServerErrorException();
        }
    }

    /**
     * Get all profiles by role.
     *
     * @return Promise<AccountEntity[]>
     */
    async findAllProfile(): Promise<AccountEntity[]> {
        // TODO: relation shipper
        try {
            return await this.accountRepository.find({
                relations: ['customers', 'staffs'],
            });
        } catch (error) {
            Logger.error(error);
            throw new InternalServerErrorException();
        }
    }

    /**
     * Update staff profile.
     *
     * @param request ProfileUpdateDto
     */
    async updateStaffProfile(request: StaffProfileUpdateDto): Promise<boolean> {
        try {
            await this.staffRepository.update(request.staff_id, request);
            return true;
        } catch (error) {
            Logger.log(error);
            throw new InternalServerErrorException();
        }
    }
}
