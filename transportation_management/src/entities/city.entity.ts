import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('City')
export class CityEntity {
    @PrimaryGeneratedColumn({ name: 'city_id' })
    public cityId: number;

    @Column({ name: 'city_name' })
    public cityName: string;
}
