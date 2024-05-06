// address-book.entity.ts
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CustomerEntity } from './customer.entity';
import { InformationEntity } from './information.entity';

@Entity('AddressBook')
export class AddressBookEntity {
    @PrimaryGeneratedColumn({ name: 'book_id' })
    bookId: number;

    @ManyToOne(() => CustomerEntity, { eager: true, nullable: true })
    @JoinColumn({ name: 'cus_id' })
    customer: CustomerEntity;

    @Column({ name: 'cus_id' })
    cusId: number;
    @Column({ name: 'is_deleted', default: false })
    isDeleted: boolean;
    @Column({ name: 'infor_id' })
    inforId: number;
    @ManyToOne(() => InformationEntity, { eager: true, nullable: true })
    @JoinColumn({ name: 'infor_id' })
    infor: InformationEntity;
}
