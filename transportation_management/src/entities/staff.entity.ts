// staff.entity.ts
import { AfterLoad, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AccountEntity } from './account.entity';
import { WarehouseEntity } from './warehouse.entity';
import { AddressEntity } from './address.entity';

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

    @Column({ nullable: true })
    status: number;

    @Column()
    warehouse_id: number;

    @ManyToOne(() => WarehouseEntity, { eager: true, nullable: true })
    @JoinColumn({ name: 'warehouse_id' })
    warehouse: WarehouseEntity;

    @Column({ nullable: true })
    acc_id: number;

    @ManyToOne(() => AccountEntity, { eager: true, nullable: true })
    @JoinColumn({ name: 'acc_id' })
    account: AccountEntity;
    private static Statuses: { [id: number]: string } = {
        1: 'Active',
        2: 'Suspended',
        3: 'Inactive',
    };

    @AfterLoad()
    public setStatusName(): void {
        this.status_name = StaffEntity.Statuses[this.status];
    }

    public status_name: string;

    @Column({ nullable: true })
    address_id: number;

    @ManyToOne(() => AddressEntity, { eager: true, nullable: true })
    @JoinColumn({ name: 'address_id' })
    address: AddressEntity;
}
