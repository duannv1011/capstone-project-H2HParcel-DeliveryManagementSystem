import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AddressEntity } from './address.entity';

@Entity('Warehouse')
export class WarehouseEntity {
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
