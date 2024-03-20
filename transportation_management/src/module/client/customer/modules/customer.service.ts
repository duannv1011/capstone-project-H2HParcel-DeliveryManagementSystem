import { HttpStatus, Injectable } from '@nestjs/common';
import { decode } from 'jsonwebtoken';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository } from 'typeorm';
import { CustomerEntity } from '../../../../entities/customer.entity';
import { DetailCustommerDto } from '../dto/get_detail_customer_dto';
import { updateCusProfileDto } from '../dto/update_profile_customer_dto';
import { AddressEntity } from 'src/entities/address.entity';
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
    async viewProfile(token: string): Promise<any> {
        const jwtPayload = decode(token) as JwtPayload;
        const customer = await this.customerRepository
            .createQueryBuilder('customer')
            .select([
                'customer.fullname',
                'customer.email',
                'customer.phone',
                'customer.default_address',
                'customer.address_id',
                'address',
                'city',
                'district',
                'ward',
            ])
            .leftJoin('customer.address', 'address')
            .leftJoin('address.city', 'city')
            .leftJoin('address.district', 'district')
            .leftJoin('address.ward', 'ward')
            .where('customer.acc_id = :accId', { accId: jwtPayload.id })
            .getOne();
        const dataView = new DetailCustommerDto();
        dataView.fullname = customer.fullname;
        dataView.email = customer.email;
        dataView.phone = customer.phone;
        const addressTotal = this.combineAddress([
            customer.address.house,
            customer.address.city.city_name,
            customer.address.district.district_name,
            customer.address.ward.ward_name,
        ]);
        dataView.address = addressTotal;
        return dataView;
    }

    async updateProfile(data: updateCusProfileDto, token: string) {
        const JwtPayload = decode(token) as JwtPayload;
        const getCustomerByAccId = await this.customerRepository.findOne({ where: { acc_id: JwtPayload.id } });
        if (!getCustomerByAccId) {
            return {
                success: false,
                error: 'not found',
                status: HttpStatus.NOT_FOUND,
            };
        }
        const getCustomerByEmail = await this.customerRepository.findOne({
            where: { email: data.email, acc_id: Not(JwtPayload.id) },
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
            data.address_id = getCustomerByAccId.address_id;
            await queryRunner.manager
                .createQueryBuilder()
                .update(AddressEntity)
                .set({
                    house: data.address_id,
                    city_id: data.city_id,
                    district_id: data.district_id,
                    ward_id: data.ward_id,
                })
                .where('address_id = :address_id', { address_id: data.address_id })
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
                    fullname: data.fullname,
                    phone: data.phone,
                })
                .where('cus_id = :cus_id', { cus_id: getCustomerByAccId.cus_id })
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
    async updateCustomerStatus(cus_id: number, status: number): Promise<any> {
        const customer = await this.customerRepository.findOneBy({ cus_id });
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
