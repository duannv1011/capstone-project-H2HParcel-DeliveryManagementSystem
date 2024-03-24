import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity('PackageType')
export class PackageTypeEntity {
    @PrimaryGeneratedColumn()
    public pk_id: number;

    @Column()
    public pk_name: Date;

    @Column()
    public pk_price: number;
}
