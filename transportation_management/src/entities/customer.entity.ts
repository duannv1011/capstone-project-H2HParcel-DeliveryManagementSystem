// customer.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, AfterLoad } from 'typeorm';
import { AccountEntity } from './account.entity';
import { AddressEntity } from './address.entity';

@Entity('Customer')
export class CustomerEntity {
    @PrimaryGeneratedColumn()
    cus_id: number;

    @Column()
    fullname: string;

    @Column()
    email: string;

    @Column()
    phone: string;

    @Column({ nullable: true })
    acc_id: number;

    @Column({ nullable: true })
    default_book: number;

    @Column({ default: 1 })
    status: number;
    @Column({ nullable: true })
    address_id: number;

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
        this.status_name = CustomerEntity.Statuses[this.status];
    }
    public getStatusName() {
        return CustomerEntity.Statuses[this.status];
    }
    public status_name: string;
}
