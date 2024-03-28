import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract-entity';

@Entity('Request')
export class RequestEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({ name: 'request_id' })
    public requestId: number;

    @Column({ name: 'order_id', nullable: false })
    public orderId: number;
}
