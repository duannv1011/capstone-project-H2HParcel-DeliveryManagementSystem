// customer.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, AfterLoad } from 'typeorm';
import { AccountEntity } from './account.entity';
import { AddressEntity } from './address.entity';

@Entity('Customer')
export class CustomerEntity {
    @PrimaryGeneratedColumn({ name: 'cus_id' })
    cusId: number;

    @Column({ name: 'fullname' })
    fullName: string;

    @Column()
    email: string;

    @Column()
    phone: string;

    @Column({ name: 'acc_id', nullable: true })
    accId: number;

    @Column({ name: 'default_book', nullable: true })
    defaultBook: number;

    @Column({ default: 1 })
    status: number;
    @Column({ name: 'address_id', nullable: true })
    addressId: number;

    @ManyToOne(() => AccountEntity, { eager: true, nullable: true })
    @JoinColumn({ name: 'acc_id' })
    account: AccountEntity;

    @ManyToOne(() => AddressEntity, { eager: true, nullable: true })
    @JoinColumn({ name: 'address_id' })
    address: AddressEntity;

    private static Statuses: { [id: number]: string } = {
        1: 'Active',
        2: 'Suspended',
        3: 'Inactive',
    };

    @AfterLoad()
    public setStatusName(): void {
        this.statusName = CustomerEntity.Statuses[this.status];
    }
    public getStatusName() {
        return CustomerEntity.Statuses[this.status];
    }
    public statusName: string;
}
