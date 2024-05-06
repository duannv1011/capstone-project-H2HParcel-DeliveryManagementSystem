import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity('PackageType')
export class PackageTypeEntity {
    @PrimaryGeneratedColumn({ name: 'pk_id' })
    public pkId: number;

    @Column({ name: 'pk_name' })
    public pkName: string;

    @Column({ name: 'pk_price', nullable: true })
    public pkPrice: string;
}
