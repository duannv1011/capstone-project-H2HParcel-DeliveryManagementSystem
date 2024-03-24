import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract-entity';

@Entity('WarehouseRule')
export class WarehouseRuleEntity extends AbstractEntity {
    @PrimaryGeneratedColumn()
    rule_id: number;

    @Column()
    warehouse_id_1: number;

    @Column()
    warehouse_id_2: number;

    @Column()
    distance: string;
}
