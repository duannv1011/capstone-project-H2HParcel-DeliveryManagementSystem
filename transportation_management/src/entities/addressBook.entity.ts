// address-book.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CustomerEntity } from './customer.entity';
import { AddressEntity } from './address.entity';

@Entity('AddressBook')
export class AddressBookEntity {
    @PrimaryGeneratedColumn()
    book_id: number;

    @ManyToOne(() => CustomerEntity, { eager: true, nullable: true })
    @JoinColumn({ name: 'cus_id' })
    customer: CustomerEntity;

    @ManyToOne(() => AddressEntity, { eager: true, nullable: true })
    @JoinColumn({ name: 'address_id' })
    address: AddressEntity;
}
