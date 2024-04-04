import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract-entity';
import { OrderEntity } from './order.entity';

@Entity('QRCode')
export class QRCodeEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({ name: 'code_id' })
    codeId: number;

    @Column({ name: 'code_value', nullable: true, unique: true })
    codeValue: string;

    @Column({ name: 'qr_url', nullable: true })
    qrUrl: string;

    @Column({ name: 'price', nullable: true })
    price: string;

    @ManyToOne(() => OrderEntity, { eager: true, nullable: true })
    @JoinColumn({ name: 'order_id' })
    order: OrderEntity;
}
