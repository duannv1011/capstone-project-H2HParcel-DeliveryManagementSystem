import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { DistrictEntity } from './district.entity';

@Entity('Ward')
export class WardEntity {
    @PrimaryGeneratedColumn()
    ward_id: number;

    @ManyToOne(() => DistrictEntity, { eager: true })
    @JoinColumn({ name: 'district_id' })
    district: DistrictEntity;

    @Column()
    ward_name: string;
}
