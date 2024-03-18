import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('QRCode')
export class QRCodeEntity {
    @PrimaryColumn()
    code_value: string;

    @Column({ nullable: true })
    order_id: number;

    @Column({ nullable: true })
    qr_url: string;

    @Column({ nullable: true })
    price: string;
}
