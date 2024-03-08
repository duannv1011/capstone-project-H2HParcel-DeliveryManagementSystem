import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerEntity } from '../../../../enities/customer.entity';

@Injectable()
export class CustomerService {
    constructor(
        @InjectRepository(CustomerEntity)
        private customerRepository: Repository<CustomerEntity>,
    ) {}
    async getInforAccount(id: number, role_id: number): Promise<any> {
        let customer = {};
        if (role_id === 1) {
            customer = await this.customerRepository.findOne({
                where: { acc_id: id },
                relations: ['account'],
            });
        }
        if (!id) {
            return { mesage: 'not found', code: HttpStatus.NOT_FOUND };
        }
        return customer;
    }
}
