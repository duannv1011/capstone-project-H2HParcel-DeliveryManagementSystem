import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RequestEntity } from './request.entity';

@Entity('RequestRecord')
export class RequestRecordEntity {
    @PrimaryGeneratedColumn({ name: 'record_id' })
    public recordId: number;

    @Column({ name: 'refer_id' })
    public referId: number;

    @ManyToOne(() => RequestEntity, { eager: true })
    @JoinColumn({ name: 'refer_id' })
    request: RequestEntity;

    @Column({ name: 'request_type' })
    public requestType: number;

    @Column({ name: 'request_stt' })
    public requestStt: number;

    @Column({ name: 'note', type: 'varchar', nullable: true })
    public note: string;
}
