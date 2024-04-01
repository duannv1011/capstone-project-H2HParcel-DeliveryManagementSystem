import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AccountEntity } from '../../entities/account.entity';
import { StaffEntity } from '../../entities/staff.entity';
import { StaffProfileUpdateDto } from '../dto/profile/staff_profile.update.dto';
import { Address, Staff, StaffResponse } from '../../module/core/staff/response/staff.reponse';
import { Builder } from 'builder-pattern';
import { AddressEntity } from '../../entities/address.entity';

@Injectable()
export class ProfileService {
    constructor(
        private dataSource: DataSource,
        @InjectRepository(AccountEntity)
        private accountRepository: Repository<AccountEntity>,
        @InjectRepository(StaffEntity)
        private staffRepository: Repository<StaffEntity>,
        @InjectRepository(AddressEntity)
        private addressRepository: Repository<AddressEntity>,
    ) {}

    /**
     * Get profiles of Staff by accId.
     *
     * @param accId accId from user login is staff.
     * @return Promise<AccountEntity>
     */
    async findOneStaffByAccId(accId: number): Promise<StaffResponse> {
        try {
            const staff = await this.staffRepository
                .createQueryBuilder('staff')
                .leftJoinAndSelect('staff.warehouse', 'warehouse')
                .leftJoinAndSelect('staff.address', 'address')
                .leftJoinAndSelect('address.city', 'city')
                .leftJoinAndSelect('address.district', 'district')
                .leftJoinAndSelect('address.ward', 'ward')
                .where({ acc_id: accId })
                .andWhere('warehouse.isActive = :isActive', { isActive: true })
                .getOne();

            return { staff: this.toStaff(staff) };
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
     * @param accId number
     */
    async updateStaffProfile(request: StaffProfileUpdateDto, accId: number): Promise<boolean> {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const staffEntity = await this.staffRepository.findOne({ where: { acc_id: accId } });

            if (staffEntity) {
                if (request.addressId) {
                    const addressEntity: AddressEntity = await this.addressRepository.findOne({
                        where: { address_id: staffEntity.address_id },
                    });

                    if (addressEntity) {
                        if (request.house) {
                            addressEntity.house = request.house;
                        }

                        if (request.city_id) {
                            addressEntity.city_id = request.city_id;
                        }

                        if (request.district_id) {
                            addressEntity.district_id = request.district_id;
                        }

                        if (request.ward_id) {
                            addressEntity.ward_id = request.ward_id;
                        }

                        await queryRunner.manager.save(addressEntity);
                    } else {
                        const address = new AddressEntity();
                        address.address_id = 0;
                        address.house = request.house;
                        address.city_id = request.city_id;
                        address.district_id = request.district_id;
                        address.ward_id = request.ward_id;
                        await queryRunner.manager.save(address);
                    }
                }

                if (request.fullname) {
                    staffEntity.fullname = request.fullname;
                }

                if (request.phone) {
                    staffEntity.phone = request.phone;
                }

                if (request.email) {
                    staffEntity.email = request.email;
                }

                await queryRunner.manager.save(staffEntity);
                await queryRunner.commitTransaction();

                return true;
            }

            return false;
        } catch (error) {
            Logger.error(error);
            await queryRunner.rollbackTransaction();
            return false;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Transform response staff.
     *
     * @param entity OrderEntity
     */
    private toStaff(entity?: StaffEntity): Staff {
        if (entity) {
            const warehouseName = entity.warehouse ? entity.warehouse.warehouse_name : '';
            const city = entity.address ? entity.address.city.city_name : '';
            const disstrict = entity.address ? entity.address.district.district_name : '';
            const wardName = entity.address ? entity.address.ward.ward_name : '';
            const house = entity.address ? entity.address.house : '';
            const address: Address = entity.address
                ? {
                      addressId: entity.address.address_id,
                      cityName: city,
                      districtName: disstrict,
                      wardName: wardName,
                      house: house,
                  }
                : null;

            return Builder<Staff>()
                .staffId(entity.staff_id)
                .fullname(entity.fullname)
                .email(entity.email)
                .phone(entity.phone)
                .statusName(entity.status_name)
                .warehouseName(warehouseName)
                .address(address)
                .build();
        }

        return Builder<Staff>().build();
    }
}
