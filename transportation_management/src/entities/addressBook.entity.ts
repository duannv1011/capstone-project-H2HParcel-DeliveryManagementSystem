// address-book.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { CustomerEntity } from './customer.entity';
import { InformationEntity } from './Information.entity';

@Entity('AddressBook')
export class AddressBookEntity {
    @PrimaryGeneratedColumn()
    book_id: number;

    @ManyToOne(() => CustomerEntity, { eager: true, nullable: true })
    @JoinColumn({ name: 'cus_id' })
    customer: CustomerEntity;

    @Column()
    cus_id: number;
    @Column()
    is_deleted: boolean;

    @ManyToOne(() => InformationEntity, { eager: true, nullable: true })
    @JoinColumn({ name: 'infor_id' })
    infor: InformationEntity;
}
