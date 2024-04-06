import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('PriceMultiplier')
export class PriceMultiplierEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'min_distance' })
    minDistance: number;

    @Column({ name: 'max_distance' })
    maxDistance: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    multiplier: number;
}
