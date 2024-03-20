import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('QRCode')
export class QRCodeEntity {
    @PrimaryGeneratedColumn()
    code_id: number;

    @Column({ nullable: true })
    code_value: string;

    @Column({ nullable: true })
    order_id: number;

    @Column({ nullable: true })
    qr_url: string;

    @Column({ nullable: true })
    price: string;
}
