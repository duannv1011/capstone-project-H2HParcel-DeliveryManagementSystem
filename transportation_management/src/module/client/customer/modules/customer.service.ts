import { HttpStatus, Injectable } from '@nestjs/common';
import { decode } from 'jsonwebtoken';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository } from 'typeorm';
import { CustomerEntity } from '../../../../entities/customer.entity';
import { DetailCustommerDto } from '../dto/get_detail_customer_dto';
import { updateCusProfileDto } from '../dto/update_profile_customer_dto';
import { AddressEntity } from 'src/entities/address.entity';
import { Response } from 'src/module/response/Response';
interface JwtPayload {
    id: number;
    username: string;
    role: string;
    iat: number;
    exp: number;
}
@Injectable()
export class CustomerService {
    constructor(
        @InjectRepository(CustomerEntity)
        private customerRepository: Repository<CustomerEntity>,
        @InjectRepository(AddressEntity)
        private addressRepository: Repository<AddressEntity>,
        private dataSource: DataSource,
    ) {}
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
            .orderBy('customer.cusId', 'ASC')
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
    async viewProfile(token: string): Promise<any> {
        const jwtPayload = decode(token) as JwtPayload;
        const customer = await this.customerRepository
            .createQueryBuilder('customer')
            .select([
                'customer.fullName',
                'customer.email',
                'customer.phone',
                'customer.default_book',
                'customer.addressId',
                'address',
                'city',
                'district',
                'ward',
            ])
            .leftJoin('customer.address', 'address')
            .leftJoin('address.city', 'city')
            .leftJoin('address.district', 'district')
            .leftJoin('address.ward', 'ward')
            .where('customer.accId = :accId', { accId: jwtPayload.id })
            .getOne();
        const dataView = new DetailCustommerDto();
        dataView.fullname = customer.fullName;
        dataView.email = customer.email;
        dataView.phone = customer.phone;
        dataView.house = customer.address.house;
        dataView.city = customer.address.city.cityName;
        dataView.district = customer.address.district.districtName;
        dataView.ward = customer.address.ward.wardName;
        return dataView;
    }

    async updateProfile(data: updateCusProfileDto, token: string) {
        const JwtPayload = decode(token) as JwtPayload;
        const getCustomerByAccId = await this.customerRepository.findOne({ where: { accId: JwtPayload.id } });
        if (!getCustomerByAccId) {
            return {
                success: false,
                error: 'not found',
                status: HttpStatus.NOT_FOUND,
            };
        }
        const getCustomerByEmail = await this.customerRepository.findOne({
            where: { email: data.email, accId: Not(JwtPayload.id) },
        });
        if (getCustomerByEmail) {
            return {
                success: false,
                error: 'duplicate email',
                status: HttpStatus.CONFLICT,
            };
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // update address
            data.addressId = getCustomerByAccId.addressId;
            await queryRunner.manager
                .createQueryBuilder()
                .update(AddressEntity)
                .set({
                    house: data.house,
                    cityId: data.cityId,
                    districtId: data.districtId,
                    wardId: data.wardId,
                })
                .where('addressId = :addressId', { addressId: data.addressId })
                .execute()
                .catch((error) => {
                    console.error('Error updating address:', error);
                    throw error;
                });
            // update customer
            await queryRunner.manager
                .createQueryBuilder()
                .update(CustomerEntity)
                .set({
                    email: data.email,
                    fullName: data.fullName,
                    phone: data.phone,
                })
                .where('cus_id = :cusId', { cusId: getCustomerByAccId.cusId })
                .execute()
                .catch((error) => {
                    console.error('Error updating customer:', error);
                    throw error;
                });
            await queryRunner.commitTransaction();
            return { success: true, msg: 'updated successfully', status: HttpStatus.OK };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            return error;
        } finally {
            await queryRunner.release();
        }
    }
    private combineAddress(parts: (string | null | undefined)[]): string {
        return parts.filter(Boolean).join(',');
    }
    async updateCustomerStatus(cusId: number, status: number): Promise<any> {
        const customer = await this.customerRepository.findOneBy({ cusId });
        if (!customer) {
            return {
                success: false,
                error: 'not found',
                status: HttpStatus.NOT_FOUND,
            };
        }
        customer.status = status;
        return {
            success: true,
            error: 'success',
            status: HttpStatus.OK,
        };
    }
}
