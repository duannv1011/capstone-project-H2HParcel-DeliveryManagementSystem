import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract-entity';
import { RequestEntity } from './request.entity';

@Entity('Order')
export class OrderEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({ name: 'order_id' })
    public orderId: number;

    @Column({ name: 'cus_id' })
    public cusId: number;

    @Column({ name: 'pickup_name' })
    public pickupName: string;

    @Column({ name: 'pickup_phone' })
    public pickupPhone: string;

    @Column({ name: 'pickup_address' })
    public pickupAddress: number;

    @Column({ name: 'pickup_transporter' })
    public pickupTransporter: number;

    @Column({ name: 'deliver_name' })
    public deliverName: string;

    @Column({ name: 'deliver_phone' })
    public deliverPhone: string;

    @Column({ name: 'deliver_address' })
    public deliverAddress: number;

    @Column({ name: 'deliver_transporter' })
    public deliverTransporter: number;

    @Column({ name: 'order_stt' })
    public orderStatus: number;

    @Column({ name: 'estimated_price' })
    public estimatedPrice: number;

    @OneToMany(() => RequestEntity, (request) => request.order)
    @JoinColumn({ name: 'order_id' })
    requests: RequestEntity[];
}
