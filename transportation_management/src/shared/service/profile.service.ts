import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AccountEntity } from '../../entities/account.entity';
import { StaffEntity } from '../../entities/staff.entity';
import { StaffProfileUpdateDto } from '../dto/profile/staff_profile.update.dto';
import { Address, Staff, StaffResponse } from '../../module/core/staff/response/staff.reponse';
import { Builder } from 'builder-pattern';
import { AddressEntity } from '../../entities/address.entity';
import { Paging } from 'src/module/response/Paging';
import { CityEntity } from 'src/entities/city.entity';
import { DistrictEntity } from 'src/entities/district.entity';
import { WardEntity } from 'src/entities/ward.entity';

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
                .where({ accId: accId })
                .andWhere('warehouse.isActive = :isActive', { isActive: true })
                .getOne();

            return { staff: this.toStaff(staff) };
        } catch (error) {
            Logger.error(error);
            throw new InternalServerErrorException();
        }
    }
    async getAllWarehouseStaffByRole(accid: number, pageNo: number, roleId: number) {
        const arrrole = [2, 3];
        const queryCondition = arrrole.includes(Number(roleId));
        const manager = await this.staffRepository.findOneBy({ accId: accid });
        const pageSize = Number(process.env.PAGE_SIZE);
        if (!manager) {
            return 'manager not found';
        }
        const [staffs, count] = await this.staffRepository
            .createQueryBuilder('s')
            .leftJoinAndSelect('s.warehouse', 'wh')
            .leftJoinAndSelect('s.address', 'a')
            .leftJoinAndSelect('a.city', 'c')
            .leftJoinAndSelect('a.district', 'd')
            .leftJoinAndSelect('a.ward', 'w')
            .leftJoinAndSelect('s.account', 'acc')
            .leftJoinAndSelect('acc.role', 'r')
            .where('s.warehouse_id =:warehouseId', { warehouseId: manager.warehouseId })
            .andWhere('acc.isActive = :isActive', { isActive: true })
            .andWhere(queryCondition ? 'r.role_id =:roleId' : 'r.role_id NOT IN (:...roleId)', {
                roleId: queryCondition ? roleId : [4, 5],
            })
            .skip((pageNo - 1) * pageSize)
            .take(pageSize)
            .getManyAndCount();
        const respone = staffs.map((s) => ({
            staffName: s.fullname,
            staffEmail: s.email,
            staffPhone: s.phone,
            staffStatus: s.statusName,
            staffRole: s.account.role.roleName,
            warehouse: s.warehouse.warehouseName,
            staffhouse: s.address ? s.address.house : '',
            staffcity: s.address ? s.address.city.cityName : '',
            staffdistrict: s.address ? s.address.district.districtName : '',
            staffward: s.address ? s.address.ward.wardName : '',
        }));
        const pageging = new Paging(pageNo, pageSize, count);

        return pageging.getPage() <= pageging.getTotalPages() ? { respone, pageging } : 'staffs not find';
    }
    /**
     * Get all profiles by accId.
     *
     * @param accId accId from user login is manager.
     * @return Promise<AccountEntity>
     */
    /**
     * Get all profiles by role.
     *
     * @return Promise<AccountEntity[]>
     */

    /**
     * Update staff profile.
     *
     * @param request ProfileUpdateDto
     * @param accId number
     */
    async updateStaffProfile(request: StaffProfileUpdateDto, accId: number): Promise<boolean> {
        const staff = await this.staffRepository.findOneBy({ accId: accId });
        if (!staff) {
            return false;
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            if (!staff.addressId) {
                //create staff
                const address = new AddressEntity();
                address.addressId = 0;
                address.house = request.house;
                address.cityId = request.cityId;
                address.districtId = request.districtId;
                address.wardId = request.wardId;
                const newAddress = await queryRunner.manager.save(AddressEntity, address);
                staff.addressId = newAddress.addressId;
                staff.address = newAddress;
            } else {
                //update adress
                const address = await this.addressRepository.findOneBy({ addressId: staff.addressId });
                if (!address) {
                    address.addressId = 0;
                }
                address.house = request.house;
                const city = new CityEntity();
                city.cityId = request.cityId;
                address.cityId = request.cityId;
                address.city = city;
                const district = new DistrictEntity();
                district.districtId = request.districtId;
                address.districtId = request.districtId;
                address.district = district;
                const ward = new WardEntity();
                ward.wardId = request.wardId;
                address.wardId = request.wardId;
                address.ward = ward;
                const newAddress = await queryRunner.manager.save(address);
                staff.addressId = newAddress.addressId;
                staff.address = newAddress;
            }
            // update staff
            staff.fullname = request.fullname;
            staff.email = request.email;
            staff.phone = request.phone;
            await queryRunner.manager.save(staff);
            await queryRunner.commitTransaction();
            return true;
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
            const warehouseName = entity.warehouse ? entity.warehouse.warehouseName : '';
            const city = entity.address ? entity.address.city.cityName : '';
            const disstrict = entity.address ? entity.address.district.districtName : '';
            const wardName = entity.address ? entity.address.ward.wardName : '';
            const house = entity.address ? entity.address.house : '';
            const address: Address = entity.address
                ? {
                      addressId: entity.address.addressId,
                      cityId: entity.address.cityId,
                      cityName: city,
                      districtId: entity.address.districtId,
                      districtName: disstrict,
                      wardId: entity.address.wardId,
                      wardName: wardName,
                      house: house,
                  }
                : null;

            return Builder<Staff>()
                .staffId(entity.staffId)
                .fullname(entity.fullname)
                .email(entity.email)
                .phone(entity.phone)
                .statusName(entity.statusName)
                .warehouseId(entity.warehouseId)
                .warehouseName(warehouseName)
                .address(address)
                .build();
        }

        return Builder<Staff>().build();
    }
}
