// staff.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from 'typeorm';
import { AccountEntity } from './account';

@Entity('Staff')
export class StaffEntity {
    @PrimaryGeneratedColumn()
    staff_id: number;

    @Column()
    fullname: string;

    @Column()
    email: string;

    @Column()
    phone: string;

    @Column()
    warehouse_id: number;

    @Column({ nullable: true })
    acc_id: number;

    @ManyToOne(() => AccountEntity, { eager: true, nullable: true })
    @JoinColumn({ name: 'acc_id' })
    account: AccountEntity;
}
