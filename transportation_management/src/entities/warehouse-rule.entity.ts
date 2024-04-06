import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract-entity';

@Entity('WarehouseRule')
export class WarehouseRuleEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({ name: 'rule_id' })
    ruleId: number;

    @Column({ name: 'warehouse_id_1' })
    warehouseId1: number;

    @Column({ name: 'warehouse_id_2' })
    warehouseId2: number;

    @Column({ name: 'distance' })
    distance: string;
}
