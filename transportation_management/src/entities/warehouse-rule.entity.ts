import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract-entity';

@Entity('WarehouseRule')
export class WarehouseRuleEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({ name: 'ruleId' })
    ruleId: number;

    @Column({ name: 'warehouseId1' })
    warehouseId1: number;

    @Column({ name: 'warehouseId2' })
    warehouseId2: number;

    @Column({ name: 'distance' })
    distance: string;
}
