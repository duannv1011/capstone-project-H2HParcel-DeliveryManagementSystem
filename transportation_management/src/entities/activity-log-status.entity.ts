import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ActivityLogStatus')
export class ActivityLogStatusEntity {
    @PrimaryGeneratedColumn({ name: 'alstt_id' })
    alsttId: number;
    @Column({ name: 'alstt_name' })
    alsttName: string;
}
