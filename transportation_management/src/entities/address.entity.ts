import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CustomerEntity } from './customer.entity';
import { CityEntity } from './city.entity';
import { DistrictEntity } from './district.entity';
import { WardEntity } from './ward.entity';

@Entity('Address')
export class AddressEntity {
    @PrimaryGeneratedColumn({ name: 'address_id' })
    public addressId: number;

    @Column({ name: 'house', nullable: true })
    public house: string;

    @Column({ name: 'city_id', nullable: true })
    public cityId: number;

    @Column({ name: 'district_id', nullable: true })
    public districtId: number;

    @Column({ name: 'ward_id', nullable: true })
    public wardId: number;

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
