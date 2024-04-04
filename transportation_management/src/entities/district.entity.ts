import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CityEntity } from './city.entity';

@Entity('District')
export class DistrictEntity {
    @PrimaryGeneratedColumn({ name: 'district_id' })
    districtId: number;

    @ManyToOne(() => CityEntity, { eager: true })
    @JoinColumn({ name: 'city_id' })
    city: CityEntity;

    @Column({ name: 'city_id' })
    cityId: number;

    @Column({ name: 'district_name' })
    districtName: string;
}
