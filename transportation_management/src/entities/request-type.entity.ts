import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract-entity';
import { RequestEntity } from './request.entity';

@Entity('RequestType')
export class RequestTypeEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({ name: 'rt_id' })
    public requestTypeId: number;

    @Column({ name: 'rt_name' })
    public requestTypeName: string;

    @OneToMany(() => RequestEntity, (request) => request.requestType)
    @JoinColumn({ name: 'request_type' })
    requests: RequestEntity[];
}
