import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ActivityLogStatusEntity } from './activity-log-status.entity';
import { AccountEntity } from './account.entity';

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

    @ManyToOne(() => ActivityLogStatusEntity, { eager: true })
    @JoinColumn({ name: 'current_status' })
    logStatus: ActivityLogStatusEntity;

    @Column({ name: 'acc_id', nullable: true })
    accId: number;
    @ManyToOne(() => AccountEntity, { eager: true })
    @JoinColumn({ name: 'acc_id' })
    account: AccountEntity;
}
