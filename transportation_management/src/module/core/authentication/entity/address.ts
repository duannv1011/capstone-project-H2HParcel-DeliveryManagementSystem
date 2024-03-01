import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
