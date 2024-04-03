import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity('OrderStatus')
export class OrderStatusEntity {
    @PrimaryGeneratedColumn({ name: 'stt_id' })
    public sttId: number;

    @Column({ name: 'stt_name' })
    public sttName: string;
}
