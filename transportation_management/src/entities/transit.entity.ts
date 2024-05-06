import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RequestRecordEntity } from './request-record.entity';
import { AbstractEntity } from './abstract-entity';
import { WarehouseEntity } from './warehouse.entity';
import { StaffEntity } from './staff.entity';

@Entity('Transit')
export class TransitEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({ name: 'transit_id' })
    public transitId: number;

    @Column({ name: 'record_id' })
    public recordId: number;

    @ManyToOne(() => RequestRecordEntity, { eager: true })
    @JoinColumn({ name: 'record_id' })
    requesrRecord: RequestRecordEntity;

    @Column({ name: 'warehouse_from' })
    public warehouseFrom: number;

    @ManyToOne(() => WarehouseEntity, { eager: true })
    @JoinColumn({ name: 'warehouse_from' })
    warehoueFromTable: WarehouseEntity;

    @Column({ name: 'warehouse_to' })
    public warehouseTo: number;

    @ManyToOne(() => WarehouseEntity, { eager: true })
    @JoinColumn({ name: 'warehouse_to' })
    warehoueToTable: WarehouseEntity;

    @Column({ name: 'staff_id' })
    public staffId: number;

    @ManyToOne(() => StaffEntity, { eager: true })
    @JoinColumn({ name: 'staff_id' })
    staff: StaffEntity;
}
