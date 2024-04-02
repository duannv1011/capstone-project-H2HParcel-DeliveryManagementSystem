import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddressEntity } from 'src/entities/address.entity';
import { AddressBookEntity } from 'src/entities/addressBook.entity';
import { CustomerEntity } from 'src/entities/customer.entity';
import { Repository, DataSource } from 'typeorm';
import { createAddresBookDto } from '../dto/create_address_book_dto';
import { Response } from 'src/module/response/Response';
import { UpdateAddresBookDto } from '../dto/update_address_book_dto';
import { InformationEntity } from 'src/entities/Information.entity';

@Injectable()
export class AddressBookService {
    constructor(
        @InjectRepository(CustomerEntity)
        private customerRepository: Repository<CustomerEntity>,
        @InjectRepository(InformationEntity)
        private informationRepository: Repository<InformationEntity>,
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
            .leftJoinAndSelect('addressbook.infor', 'infor')
            .leftJoinAndSelect('infor.address', 'address')
            .leftJoinAndSelect('address.city', 'city')
            .leftJoinAndSelect('address.district', 'district')
            .leftJoinAndSelect('address.ward', 'ward')
            .where('addressbook.cus_id = :cus_id', { cus_id: cus_id })
            .andWhere('addressbook.is_deleted = :is_deleted', { is_deleted: false })
            .orderBy('addressbook.book_id', 'ASC')
            .getMany();
        const transformedListAddressBook = listAddressBook.map((item) => ({
            book_id: item.book_id,
            name: item.infor.name,
            phone: item.infor.phone,
            house: item.infor.address.house,
            city: item.infor.address.city.city_name,
            district: item.infor.address.district.district_name,
            ward: item.infor.address.ward.ward_name,
        }));

        return { addressbooks: transformedListAddressBook, default_book: customer.default_book };
    }
    async getDefaultBookByCusId(acc_id: number) {
        const customer = await this.customerRepository.findOne({ where: { acc_id: acc_id } });
        if (!customer) {
            return new Response(404, 'Customer not found ', null);
        }
        const cus_id = customer.cus_id;
        const listAddressBook = await this.addressBookRepository
            .createQueryBuilder('addressbook')
            .leftJoinAndSelect('addressbook.infor', 'infor')
            .leftJoinAndSelect('infor.address', 'address')
            .leftJoinAndSelect('address.city', 'city')
            .leftJoinAndSelect('address.district', 'district')
            .leftJoinAndSelect('address.ward', 'ward')
            .where('addressbook.cus_id = :cus_id', { cus_id: cus_id })
            .andWhere('addressbook.is_deleted = :is_deleted', { is_deleted: false })
            .andWhere('addressbook.book_id = :book_id', { book_id: customer.default_book })
            .orderBy('addressbook.book_id', 'ASC')
            .getMany();
        const transformedListAddressBook = listAddressBook.map((item) => ({
            book_id: item.book_id,
            name: item.infor.name,
            phone: item.infor.phone,
            house: item.infor.address.house,
            city: item.infor.address.city.city_name,
            district: item.infor.address.district.district_name,
            ward: item.infor.address.ward.ward_name,
            infor_id: item.infor.infor_id,
        }));

        return { addressbooks: transformedListAddressBook };
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
            //create Information
            const information = await queryRunner.manager
                .save(InformationEntity, {
                    name: data.name,
                    phone: data.phone,
                    address: address,
                })
                .catch((error) => {
                    console.error('Error save information:', error);
                    throw error;
                });
            //create AddressBook
            const addressBook = await queryRunner.manager
                .save(AddressBookEntity, {
                    customer: customer,
                    is_deleted: false,
                    infor: information,
                })
                .catch((error) => {
                    console.error('Error save addressBook:', error);
                    throw error;
                });

            await queryRunner.commitTransaction();
            return new Response(200, 'success', { book_id: addressBook.book_id });
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
        await this.addressBookRepository
            .findOne({
                where: { customer: customer, book_id: book_id, is_deleted: false },
            })
            .catch((err) => {
                return err.message;
            });
        const update = await this.customerRepository
            .createQueryBuilder()
            .update(CustomerEntity, { default_book: book_id })
            .where('acc_id=:acc_id', { acc_id: acc_id })
            .execute();
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
        console.log(book_id);
        if (!adressBook) {
            return new Response(404, 'addressBook in this customer not found ', null);
        }
        adressBook.is_deleted = true;
        await this.addressBookRepository.save(adressBook);
        if (book_id === customer.default_book) {
            await this.customerRepository
                .createQueryBuilder()
                .update(CustomerEntity, { default_book: null })
                .where('acc_id=:acc_id', { acc_id: acc_id })
                .execute();
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
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            //update address
            await this.addressRepository
                .createQueryBuilder()
                .update()
                .set({
                    house: data.house,
                    city_id: data.city_id,
                    district_id: data.district_id,
                    ward_id: data.ward_id,
                })
                .where('address_id = :addressId', { addressId: adressBook.infor.address.address_id })
                .execute();
            //update information
            await this.informationRepository
                .createQueryBuilder()
                .update()
                .set({ name: data.name, phone: data.phone })
                .where('infor_id=:infor_id', { infor_id: adressBook.infor.infor_id })
                .execute();
            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            return error;
        } finally {
            await queryRunner.release();
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
            .where('address_id = :addressId', { addressId: adressBook.infor.infor_id })
            .execute();

        return 'success';
    }
}
