import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AddressEntity } from './address.entity';
import { AbstractEntity } from './abstract-entity';

@Entity('Warehouse')
export class WarehouseEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({ name: 'warehouse_id' })
    warehouseId: number;

    @Column({ name: 'address_id' })
    addressId: number;

    @ManyToOne(() => AddressEntity, { eager: true, nullable: true })
    @JoinColumn({ name: 'address_id' })
    address: AddressEntity;

    @Column({ name: 'warehouse_name' })
    warehouseName: string;

    @Column({ default: true, nullable: true })
    isActive: boolean;
}
