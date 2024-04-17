import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DistrictEntity } from './district.entity';
import { WarehouseEntity } from './warehouse.entity';

@Entity('Ward')
export class WardEntity {
    @PrimaryGeneratedColumn({ name: 'ward_id' })
    wardId: number;

    @ManyToOne(() => DistrictEntity, { eager: true })
    @JoinColumn({ name: 'district_id' })
    district: DistrictEntity;

    @Column({ name: 'ward_name' })
    wardName: string;

    @Column({ name: 'warehouse_id', nullable: false })
    warehouseId: number;

    @ManyToOne(() => WarehouseEntity, { eager: true })
    @JoinColumn({ name: 'warehouse_id' })
    warehouse: WarehouseEntity;
}
