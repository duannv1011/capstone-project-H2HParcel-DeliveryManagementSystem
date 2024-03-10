import { Injectable } from '@nestjs/common';
import { decode } from 'jsonwebtoken';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerEntity } from '../../../../entities/customer.entity';
import { DetailCustommerDto } from '../dto/get_detail_customer_dto';
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
    private combineAddress(parts: (string | null | undefined)[]): string {
        return parts.filter(Boolean).join(',');
    }
}
