import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OrderEntity } from './order.entity';
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

    @ManyToOne(() => OrderEntity, (order) => order.codes, { eager: true, nullable: true })
    @JoinColumn({ name: 'order_id' })
    order: OrderEntity;
}
