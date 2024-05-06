import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract-entity';

@Entity('RequestType')
export class RequestTypeEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({ name: 'rt_id' })
    public requestTypeId: number;

    @Column({ name: 'rt_name' })
    public requestTypeName: string;
}
