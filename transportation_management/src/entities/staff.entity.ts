// staff.entity.ts
import { AfterLoad, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AccountEntity } from './account.entity';
import { WarehouseEntity } from './warehouse.entity';
import { AddressEntity } from './address.entity';

@Entity('Staff')
export class StaffEntity {
    @PrimaryGeneratedColumn({ name: 'staff_id' })
    staffId: number;

    @Column()
    fullname: string;

    @Column()
    email: string;

    @Column()
    phone: string;

    @Column({ nullable: true })
    status: number;

    @Column({ name: 'warehouse_id' })
    warehouseId: number;

    @ManyToOne(() => WarehouseEntity, { eager: true, nullable: true })
    @JoinColumn({ name: 'warehouse_id' })
    warehouse: WarehouseEntity;

    @Column({ name: 'acc_id', nullable: true })
    accId: number;

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
        this.statusName = StaffEntity.Statuses[this.status];
    }

    public statusName: string;

    @Column({ name: 'address_id', nullable: true })
    addressId: number;

    @ManyToOne(() => AddressEntity, { eager: true, nullable: true })
    @JoinColumn({ name: 'address_id' })
    address: AddressEntity;
}
