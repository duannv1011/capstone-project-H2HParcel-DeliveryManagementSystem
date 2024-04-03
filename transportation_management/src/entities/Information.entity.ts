import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AddressEntity } from './address.entity';

@Entity('Information')
export class InformationEntity {
    @PrimaryGeneratedColumn({ name: 'infor_id' })
    inforId: number;

    @Column({ name: 'name', nullable: true })
    name: string;

    @Column({ name: 'phone', nullable: true })
    phone: string;

    @ManyToOne(() => AddressEntity, { eager: true, nullable: true })
    @JoinColumn({ name: 'address_id' })
    address: AddressEntity;
}
