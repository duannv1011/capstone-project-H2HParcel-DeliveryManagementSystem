// customer.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from 'typeorm';
import { AccountEntity } from './account.entity';

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
    default_address: number;

    @Column({ default: 1 })
    status: number;

    @Column({ nullable: true })
    address_id: number;

    @ManyToOne(() => AccountEntity, { eager: true, nullable: true })
    @JoinColumn({ name: 'acc_id' })
    account: AccountEntity;
}
