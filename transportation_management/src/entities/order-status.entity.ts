import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity('OrderStatus')
export class OrderStatusEntity {
    @PrimaryGeneratedColumn()
    public stt_id: number;

    @Column()
    public stt_name: string;
}
