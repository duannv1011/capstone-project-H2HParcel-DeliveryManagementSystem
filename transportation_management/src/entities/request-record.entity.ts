import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RequestEntity } from './request.entity';

@Entity('RequestRecord')
export class RequestRecordEntity {
    @PrimaryGeneratedColumn()
    public record_id: number;

    @Column()
    public refer_id: number;

    @ManyToOne(() => RequestEntity, { eager: true })
    @JoinColumn({ name: 'refer_id' })
    request: RequestEntity;

    @Column()
    public request_type: number;

    @Column()
    public request_stt: number;

    @Column({ type: 'varchar', nullable: true })
    public note: string;
}
