import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('City')
export class CityEntity {
    @PrimaryGeneratedColumn()
    public city_id: number;

    @Column()
    public city_name: string;
}
