import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('RequestRecord')
export class RequestRecordEntity {
    @PrimaryGeneratedColumn({ name: 'record_id' })
    public recordId: number;

    @Column({ name: 'request_type' })
    public requestType: number;

    @Column({ name: 'request_stt' })
    public requestStt: number;

    @Column({ name: 'note', type: 'varchar', nullable: true })
    public note: string;
}
