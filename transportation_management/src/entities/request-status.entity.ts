import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract-entity';

@Entity('RequestStatus')
export class RequestStatusEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({ name: 'rt_id' })
    public rqs_id: number;

    @Column({ name: 'rts_name' })
    public rts_name: string;
}
