import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AccountEntity } from '../../authentication/entity/account';

@Entity('Customer')
export class CustomerEntity {
    @PrimaryGeneratedColumn()
    cus_id: number;

    @Column({ nullable: true })
    fullname: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    status: string;

    @Column()
    acc_id: number;

    @Column({ nullable: true })
    default_address: number;

    @ManyToOne(() => AccountEntity, { eager: true })
    @JoinColumn({ name: 'acc_id' })
    account: AccountEntity;
}
