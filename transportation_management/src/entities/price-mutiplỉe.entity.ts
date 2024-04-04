import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('PriceMultiplier')
export class PriceMultiplierEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'max_distance' })
    maxDistance: number;

    @Column()
    multiplier: number;
}
