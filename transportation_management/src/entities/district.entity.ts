import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CityEntity } from './city.entity';

@Entity('District')
export class DistrictEntity {
    @PrimaryGeneratedColumn()
    district_id: number;

    @ManyToOne(() => CityEntity, { eager: true })
    @JoinColumn({ name: 'city_id' })
    city: CityEntity;

    @Column()
    city_id: number;

    @Column()
    district_name: string;
}
