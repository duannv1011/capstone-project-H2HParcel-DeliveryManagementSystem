import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract-entity';
import { InformationEntity } from './Information.entity';
import { OrderEntity } from './order.entity';

@Entity('Request')
export class RequestEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({ name: 'request_id' })
    public requestId: number;

    @Column({ name: 'order_id', nullable: false })
    public orderId: number;

    @Column({ name: 'pickup_infor', nullable: true })
    pickupInfor: number;

    @Column({ name: 'deliver_infor', nullable: true })
    deliverInfor: number;

    @OneToOne(() => InformationEntity, { eager: true })
    @JoinColumn({ name: 'pickup_infor' })
    pickupInformation: InformationEntity;

    @OneToOne(() => InformationEntity, { eager: true })
    @JoinColumn({ name: 'deliver_infor' })
    deliverInformation: InformationEntity;

    @ManyToOne(() => OrderEntity, { eager: true })
    @JoinColumn({ name: 'order_id' })
    order: OrderEntity;
}
