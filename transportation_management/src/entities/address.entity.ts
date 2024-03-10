import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CustomerEntity } from './customer.entity';
import { CityEntity } from './city.entity';
import { DistrictEntity } from './district.entity';
import { WardEntity } from './ward.entity';

@Entity('Address')
export class AddressEntity {
    @PrimaryGeneratedColumn()
    public address_id: number;

    @Column({ nullable: true })
    public house: string;

    @Column({ nullable: true })
    public city_id: number;

    @Column({ nullable: true })
    public district_id: number;

    @Column({ nullable: true })
    public ward_id: number;

    @ManyToOne(() => CityEntity, { eager: true })
    @JoinColumn({ name: 'city_id' })
    city: CityEntity;

    @ManyToOne(() => DistrictEntity, { eager: true })
    @JoinColumn({ name: 'district_id' })
    district: DistrictEntity;

    @ManyToOne(() => WardEntity, { eager: true })
    @JoinColumn({ name: 'ward_id' })
    ward: WardEntity;

    @OneToMany(() => CustomerEntity, (customer) => customer.address)
    customers: CustomerEntity[];
}
