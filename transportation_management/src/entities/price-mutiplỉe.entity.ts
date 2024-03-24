import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('PriceMultiplier')
export class PriceMultiplierEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    maxDistance: number;

    @Column()
    multiplier: number;
}
