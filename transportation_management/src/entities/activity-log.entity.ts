import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { StaffEntity } from './staff.entity';

@Entity('ActivityLog')
export class ActivityLogEntity {
    @PrimaryGeneratedColumn({ name: 'log_id' })
    logId: number;
    @Column({ name: 'order_id' })
    orderId: number;
    @Column({ name: 'time', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    time: Date;
    @Column({ name: 'current_status' })
    currentStatus: number;
    @Column({ name: 'staff_id', nullable: true })
    staffId: number;
    @ManyToOne(() => StaffEntity, { eager: true })
    @JoinColumn({ name: 'staff_id' })
    staff: StaffEntity;
}
