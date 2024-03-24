import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract-entity';
import { OrderEntity } from './order.entity';

@Entity('Request')
export class RequestEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({ name: 'request_id' })
    public requestId: number;

    @Column({ name: 'order_id', nullable: false })
    public orderId: number;

    @ManyToOne(() => OrderEntity, (order) => order.requests, { eager: true })
    @JoinColumn({ name: 'order_id' })
    order: OrderEntity;
}
