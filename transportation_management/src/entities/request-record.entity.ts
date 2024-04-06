import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RequestEntity } from './request.entity';
import { TransitEntity } from './transit.entity';

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

    @OneToMany(() => RequestEntity, (request) => request.requesrRecord)
    requests: RequestEntity[];
    @OneToMany(() => TransitEntity, (transit) => transit.requesrRecord)
    transits: TransitEntity[];
}
