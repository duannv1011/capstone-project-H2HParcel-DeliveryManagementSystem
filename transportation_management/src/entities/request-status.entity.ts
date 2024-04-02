import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract-entity';

@Entity('RequestStatus')
export class RequestStatusEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({ name: 'rqs_id' })
    public rqs_id: number;

    @Column({ name: 'rqs_name', nullable: true })
    public rqs_name: string;
}
