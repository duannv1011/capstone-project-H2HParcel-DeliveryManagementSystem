import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AddressEntity } from './address.entity';
import { AbstractEntity } from './abstract-entity';

@Entity('Warehouse')
export class WarehouseEntity extends AbstractEntity {
    @PrimaryGeneratedColumn()
    warehouse_id: number;

    @Column()
    address_id: number;

    @ManyToOne(() => AddressEntity, { eager: true, nullable: true })
    @JoinColumn({ name: 'address_id' })
    adress: AddressEntity;

    @Column()
    warehouse_name: string;
}
