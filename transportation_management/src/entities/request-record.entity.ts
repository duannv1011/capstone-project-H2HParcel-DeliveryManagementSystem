import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RequestEntity } from './request.entity';
import { TransitEntity } from './transit.entity';
import { RequestTypeEntity } from './request-type.entity';
import { RequestStatusEntity } from './request-status.entity';
import { AbstractEntity } from './abstract-entity';

@Entity('RequestRecord')
export class RequestRecordEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({ name: 'record_id' })
    public recordId: number;

    @Column({ name: 'request_type' })
    public requestType: number;

    @ManyToOne(() => RequestTypeEntity, { eager: true, nullable: true })
    @JoinColumn({ name: 'request_type' })
    public requestTypeTable: RequestTypeEntity;

    @Column({ name: 'request_stt' })
    public requestStt: number;

    @ManyToOne(() => RequestStatusEntity, { eager: true, nullable: true })
    @JoinColumn({ name: 'request_stt' })
    public requestStatus: RequestStatusEntity;

    @Column({ name: 'note', type: 'varchar', nullable: true })
    public note: string;

    @OneToOne(() => RequestEntity, (request) => request.requesrRecord)
    requests: RequestEntity;

    @OneToOne(() => TransitEntity, (transit) => transit.requesrRecord)
    transits: TransitEntity;
}
