import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity('Transit')
export class TransitEntity {
    @PrimaryGeneratedColumn()
    public transit_id: number;

    @Column()
    public warehouse_from: number;

    @Column()
    public warehouse_to: number;

    @Column()
    public staff_id: number;
}
