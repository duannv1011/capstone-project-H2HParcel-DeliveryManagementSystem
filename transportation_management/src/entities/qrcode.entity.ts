import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract-entity';

@Entity('QRCode')
export class QRCodeEntity extends AbstractEntity {
    @PrimaryGeneratedColumn()
    code_id: number;

    @Column({ nullable: true, unique: true })
    code_value: string;

    @Column({ nullable: true })
    qr_url: string;

    @Column({ nullable: true })
    price: string;
}
