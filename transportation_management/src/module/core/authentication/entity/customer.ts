// customer.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from 'typeorm';
import { AccountEntity } from './account';

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

    @Column()
    default_address: number;

    @Column()
    status: number;

    @Column({ nullable: true })
    acc_id: number;

    @ManyToOne(() => AccountEntity, { eager: true, nullable: true })
    @JoinColumn({ name: 'acc_id' })
    account: AccountEntity;
}
