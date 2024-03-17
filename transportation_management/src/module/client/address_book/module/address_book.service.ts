import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddressEntity } from 'src/entities/address.entity';
import { AddressBookEntity } from 'src/entities/addressBook.entity';
import { CustomerEntity } from 'src/entities/customer.entity';
import { Repository, DataSource } from 'typeorm';
import { createAddresBookDto } from '../dto/create_address_book_dto';
import { Response } from 'src/module/response/Response';
import { UpdateAddresBookDto } from '../dto/update_address_book_dto';

@Injectable()
export class AddressBookService {
    constructor(
        @InjectRepository(CustomerEntity)
        private customerRepository: Repository<CustomerEntity>,
        @InjectRepository(AddressBookEntity)
        private addressBookRepository: Repository<AddressBookEntity>,
        @InjectRepository(AddressEntity)
        private addressRepository: Repository<AddressEntity>,
        private dataSource: DataSource,
    ) {}
    async getAddressBookByCusId(acc_id: number) {
        const customer = await this.customerRepository.findOne({ where: { acc_id: acc_id } });
        if (!customer) {
            return new Response(404, 'Customer not found ', null);
        }
        const cus_id = customer.cus_id;
        const listAddressBook = await this.addressBookRepository
            .createQueryBuilder('addressbook')
            .select([
                'addressbook.book_id',
                'addressbook.cus_id',
                'addressbook.address_id',
                'address.city_id',
                'address.district_id',
                'address.ward_id',
                'address.house',
                'city.city_name',
                'district.district_name',
                'ward.ward_name',
            ])
            .leftJoin('addressbook.address', 'address', 'address.address_id = addressbook.address_id')
            .leftJoin('address.city', 'city')
            .leftJoin('address.district', 'district')
            .leftJoin('address.ward', 'ward')
            .where('addressbook.cus_id = :cus_id', { cus_id: cus_id })
            .andWhere('addressbook.is_deleted = :is_deleted', { is_deleted: false })
            .orderBy('addressbook.book_id', 'ASC')
            .getMany();
        const transformedListAddressBook = listAddressBook.map((item) => ({
            book_id: item.book_id,
            address_id: item.address_id,
            house: item.address.house,
            city: item.address.city.city_name,
            district: item.address.district.district_name,
        }));

        return { addressbooks: transformedListAddressBook, default_address: customer.default_address };
    }
    async createAddressBook(data: createAddresBookDto, accId: number) {
        const customer = await this.customerRepository.findOne({ where: { acc_id: accId } });
        if (!customer) {
            return new Response(404, 'Customer not found ', null);
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            //create Address
            const address = await queryRunner.manager
                .save(AddressEntity, {
                    house: data.house,
                    city_id: data.city_id,
                    district_id: data.district_id,
                    ward_id: data.ward_id,
                })
                .catch((error) => {
                    console.error('Error save address:', error);
                    throw error;
                });
            //create AddressBook
            const addressBook = await queryRunner.manager
                .save(AddressBookEntity, { cus_id: customer.cus_id, address_id: address.address_id })
                .catch((error) => {
                    console.error('Error save address:', error);
                    throw error;
                });
            await queryRunner.commitTransaction();
            return new Response(200, 'success', addressBook);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            return error;
        } finally {
            await queryRunner.release();
        }
    }
    async setDefaultAddressBook(book_id: number, acc_id: number) {
        const customer = await this.customerRepository.findOne({ where: { acc_id: acc_id } });
        if (!customer) {
            return new Response(404, 'Customer not found ', null);
        }
        const adressBook = await this.addressBookRepository.findOne({
            where: { cus_id: customer.cus_id, book_id: book_id, is_deleted: false },
        });
        if (!adressBook) {
            return new Response(404, 'addressBook this customer not found ', null);
        }
        customer.default_address = book_id;
        const update = await this.customerRepository.save(customer);
        return update ? 'set successfull' : 'set error';
    }
    async softDelete(book_id: number, acc_id: number) {
        const customer = await this.customerRepository.findOne({ where: { acc_id: acc_id } });
        if (!customer) {
            return new Response(404, 'Customer not found ', null);
        }
        const adressBook = await this.addressBookRepository.findOne({
            where: { cus_id: customer.cus_id, book_id: book_id, is_deleted: false },
        });
        if (!adressBook) {
            return new Response(404, 'addressBook in this customer not found ', null);
        }
        adressBook.is_deleted = true;
        await this.addressBookRepository.save(adressBook);
        if (book_id === customer.default_address) {
            customer.default_address = null;
            await this.customerRepository.save(customer);
        }
        return 'success';
    }
    async updateAddressbook(data: UpdateAddresBookDto, acc_id: number) {
        const customer = await this.customerRepository.findOne({ where: { acc_id: acc_id } });
        if (!customer) {
            return new Response(404, 'Customer not found ', null);
        }
        const adressBook = await this.addressBookRepository.findOne({
            where: { cus_id: customer.cus_id, book_id: data.book_id, is_deleted: false },
        });
        if (!adressBook) {
            return new Response(404, 'addressBook in this customer not found ', null);
        }
        await this.addressRepository
            .createQueryBuilder()
            .update()
            .set({
                house: data.house,
                city_id: data.city_id,
                district_id: data.district_id,
                ward_id: data.ward_id,
            })
            .where('address_id = :addressId', { addressId: adressBook.address_id })
            .execute();

        return 'success';
    }
}
