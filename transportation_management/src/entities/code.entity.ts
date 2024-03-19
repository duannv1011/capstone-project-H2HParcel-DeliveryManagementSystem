import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { AbstractEntity } from './abstract-entity';
import { OrderEntity } from './order.entity';

@Entity('Code')
export class CodeEntity extends AbstractEntity {
    @PrimaryColumn({ name: 'code_value' })
    codeValue: string;

    @Column({ nullable: true })
    price: string;

    @ManyToOne(() => OrderEntity, (order) => order.codes, { eager: true, nullable: true })
    @JoinColumn({ name: 'order_id' })
    order: OrderEntity;
}
