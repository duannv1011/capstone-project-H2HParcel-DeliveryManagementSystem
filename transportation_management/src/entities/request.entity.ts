import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract-entity';
import { RequestTypeEntity } from './request-type.entity';
import { OrderEntity } from './order.entity';

@Entity('Request')
export class RequestEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({ name: 'request_id' })
    public requestId: number;

    @Column({ name: 'order_id', nullable: false })
    public orderId: number;

    @Column({ name: 'request_type', nullable: false })
    public requestType: number;

    @Column({ name: 'request_stt', nullable: false })
    public requestStatus: number;

    @Column()
    public note: string;

    @ManyToOne((type) => RequestTypeEntity, (requestType) => requestType.requests, { eager: true })
    @JoinColumn({ name: 'request_type' })
    requestTypeRef: RequestTypeEntity;

    @ManyToOne((type) => OrderEntity, (order) => order.requests, { eager: true })
    @JoinColumn({ name: 'order_id' })
    order: OrderEntity;
}
