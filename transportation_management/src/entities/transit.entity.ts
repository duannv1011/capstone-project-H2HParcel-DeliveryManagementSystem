import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Transit')
export class TransitEntity {
    @PrimaryGeneratedColumn({ name: 'transit_id' })
    public transitId: number;

    @Column({ name: 'warehouse_from' })
    public warehouseFrom: number;

    @Column({ name: 'warehouse_to' })
    public warehouseTo: number;

    @Column({ name: 'staff_id' })
    public staffId: number;
}
