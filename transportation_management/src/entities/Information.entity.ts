import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AddressEntity } from './address.entity';

@Entity('Information')
export class InformationEntity {
    @PrimaryGeneratedColumn()
    infor_id: number;

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    phone: string;

    @ManyToOne(() => AddressEntity, { eager: true, nullable: true })
    @JoinColumn({ name: 'address_id' })
    address: AddressEntity;
}
