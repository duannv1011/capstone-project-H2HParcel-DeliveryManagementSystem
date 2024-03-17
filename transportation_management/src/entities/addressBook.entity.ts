// address-book.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { CustomerEntity } from './customer.entity';
import { AddressEntity } from './address.entity';

@Entity('AddressBook')
export class AddressBookEntity {
    @PrimaryGeneratedColumn()
    book_id: number;

    @Column()
    cus_id: number;

    @Column()
    address_id: number;

    @Column()
    is_deleted: boolean;

    @ManyToOne(() => CustomerEntity, { eager: true, nullable: true })
    @JoinColumn({ name: 'cus_id' })
    customer: CustomerEntity;

    @ManyToOne(() => AddressEntity, { eager: true, nullable: true })
    @JoinColumn({ name: 'address_id' })
    address: AddressEntity;
}
