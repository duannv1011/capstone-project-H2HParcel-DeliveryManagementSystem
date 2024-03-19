import { BaseEntity, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class AbstractEntity extends BaseEntity {
    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    date_create_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    date_update_at: Date;

    @Column({ name: 'is_deleted', default: 0 })
    isDeleted: number;
}
