// staff.entity.ts
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AccountEntity } from './account.entity';
import { WarehouseEntity } from './warehouse.entity';

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

    @ManyToOne(() => WarehouseEntity, { eager: true, nullable: true })
    @JoinColumn({ name: 'warehouse_id' })
    warehouse: AccountEntity;

    @Column({ nullable: true })
    acc_id: number;

    @ManyToOne(() => AccountEntity, { eager: true, nullable: true })
    @JoinColumn({ name: 'acc_id' })
    account: AccountEntity;
}
