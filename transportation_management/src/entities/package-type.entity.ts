import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity('PackageType')
export class PackageTypeEntity {
    @PrimaryGeneratedColumn()
    public pk_id: number;

    @Column()
    public pk_name: string;

    @Column({ nullable: true })
    public pk_price: string;
}
