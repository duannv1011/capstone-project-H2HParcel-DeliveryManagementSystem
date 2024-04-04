import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddressEntity } from 'src/entities/address.entity';
import { AddressBookEntity } from 'src/entities/address-book.entity';
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
    async getAddressBookByCusId(accId: number) {
        const customer = await this.customerRepository.findOne({ where: { accId: accId } });
        if (!customer) {
            return new Response(404, 'Customer not found ', null);
        }
        const cusId = customer.cusId;
        const listAddressBook = await this.addressBookRepository
            .createQueryBuilder('addressbook')
            .leftJoinAndSelect('addressbook.infor', 'infor')
            .leftJoinAndSelect('infor.address', 'address')
            .leftJoinAndSelect('address.city', 'city')
            .leftJoinAndSelect('address.district', 'district')
            .leftJoinAndSelect('address.ward', 'ward')
            .where('addressbook.cus_id = :cusId', { cusId: cusId })
            .andWhere('addressbook.is_deleted = :is_deleted', { is_deleted: false })
            .orderBy('addressbook.bookId', 'ASC')
            .getMany();
        const transformedListAddressBook = listAddressBook.map((item) => ({
            bookId: item.bookId,
            name: item.infor.name,
            phone: item.infor.phone,
            house: item.infor.address.house,
            city: item.infor.address.city.cityName,
            district: item.infor.address.district.districtName,
            ward: item.infor.address.ward.wardName,
            inforId: item.infor.inforId,
        }));

        return { addressbooks: transformedListAddressBook, default_book: customer.defaultBook };
    }
    async getAddressBookById(accId: number, bookId: number) {
        const customer = await this.customerRepository.findOne({ where: { accId: accId } });
        if (!customer) {
            return new Response(404, 'Customer not found ', null);
        }
        const cusId = customer.cusId;
        const AddressBook = await this.addressBookRepository
            .createQueryBuilder('addressbook')
            .leftJoinAndSelect('addressbook.infor', 'infor')
            .leftJoinAndSelect('infor.address', 'address')
            .leftJoinAndSelect('address.city', 'city')
            .leftJoinAndSelect('address.district', 'district')
            .leftJoinAndSelect('address.ward', 'ward')
            .where('addressbook.cus_id = :cusId', { cusId: cusId })
            .andWhere('addressbook.is_deleted = :is_deleted', { is_deleted: false })
            .andWhere('addressbook.book_id = :bookId', { bookId: bookId })
            .orderBy('addressbook.book_id', 'ASC')
            .getMany();
        const transformedListAddressBook = AddressBook.map((item) => ({
            bookId: item.bookId,
            name: item.infor.name,
            phone: item.infor.phone,
            house: item.infor.address.house,
            city: item.infor.address.city.cityName,
            district: item.infor.address.district.districtName,
            ward: item.infor.address.ward.wardName,
            inforId: item.infor.inforId,
        }));

        return { addressbooks: transformedListAddressBook };
    }
    async getDefaultBookByCusId(accId: number) {
        const customer = await this.customerRepository.findOne({ where: { accId: accId } });
        if (!customer) {
            return new Response(404, 'Customer not found ', null);
        }
        const cusId = customer.cusId;
        const listAddressBook = await this.addressBookRepository
            .createQueryBuilder('addressbook')
            .leftJoinAndSelect('addressbook.infor', 'infor')
            .leftJoinAndSelect('infor.address', 'address')
            .leftJoinAndSelect('address.city', 'city')
            .leftJoinAndSelect('address.district', 'district')
            .leftJoinAndSelect('address.ward', 'ward')
            .where('addressbook.cus_id = :cusId', { cusId: cusId })
            .andWhere('addressbook.is_deleted = :is_deleted', { is_deleted: false })
            .andWhere('addressbook.book_id = :bookId', { bookId: customer.defaultBook })
            .orderBy('addressbook.book_id', 'ASC')
            .getMany();
        const transformedListAddressBook = listAddressBook.map((item) => ({
            bookId: item.bookId,
            name: item.infor.name,
            phone: item.infor.phone,
            house: item.infor.address.house,
            city: item.infor.address.city.cityName,
            district: item.infor.address.district.districtName,
            ward: item.infor.address.ward.wardName,
            inforId: item.infor.inforId,
        }));

        return { addressbooks: transformedListAddressBook };
    }
    async createAddressBook(data: createAddresBookDto, accId: number) {
        const customer = await this.customerRepository.findOne({ where: { accId: accId } });
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
                    cityId: data.cityId,
                    districtId: data.districtId,
                    wardId: data.wardId,
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
            return new Response(200, 'success', { bookId: addressBook.bookId });
        } catch (error) {
            await queryRunner.rollbackTransaction();
            return error;
        } finally {
            await queryRunner.release();
        }
    }
    async setDefaultAddressBook(bookId: number, accId: number) {
        const customer = await this.customerRepository.findOne({ where: { accId: accId } });
        if (!customer) {
            return new Response(404, 'Customer not found ', null);
        }
        await this.addressBookRepository
            .findOne({
                where: { customer: customer, bookId: bookId, isDeleted: false },
            })
            .catch((err) => {
                return err.message;
            });
        const update = await this.customerRepository
            .createQueryBuilder()
            .update(CustomerEntity, { defaultBook: bookId })
            .where('acc_id=:accId', { accId: accId })
            .execute();
        return update ? 'set successfull' : 'set error';
    }
    async softDelete(bookId: number, accId: number) {
        const customer = await this.customerRepository.findOne({ where: { accId: accId } });
        if (!customer) {
            return new Response(404, 'Customer not found ', null);
        }
        const adressBook = await this.addressBookRepository.findOne({
            where: { cusId: customer.cusId, bookId: bookId, isDeleted: false },
        });
        console.log(bookId);
        if (!adressBook) {
            return new Response(404, 'addressBook in this customer not found ', null);
        }
        adressBook.isDeleted = true;
        await this.addressBookRepository.save(adressBook);
        if (bookId === customer.defaultBook) {
            await this.customerRepository
                .createQueryBuilder()
                .update(CustomerEntity, { defaultBook: null })
                .where('acc_id=:accId', { accId: accId })
                .execute();
        }
        return 'success';
    }
    async updateAddressbook(data: UpdateAddresBookDto, accId: number) {
        const customer = await this.customerRepository.findOne({ where: { accId: accId } });
        if (!customer) {
            return new Response(404, 'Customer not found ', null);
        }
        const adressBook = await this.addressBookRepository.findOne({
            where: { cusId: customer.cusId, bookId: data.bookId, isDeleted: false },
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
                    cityId: data.cityId,
                    districtId: data.districtId,
                    wardId: data.wardId,
                })
                .where('address_id = :addressId', { addressId: adressBook.infor.address.addressId })
                .execute();
            //update information
            await this.informationRepository
                .createQueryBuilder()
                .update()
                .set({ name: data.name, phone: data.phone })
                .where('infor_id=:inforId', { inforId: adressBook.infor.inforId })
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
                cityId: data.cityId,
                districtId: data.districtId,
                wardId: data.wardId,
            })
            .where('addressId = :addressId', { addressId: adressBook.infor.inforId })
            .execute();

        return 'success';
    }
}
