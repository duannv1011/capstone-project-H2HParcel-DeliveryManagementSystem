import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ShiftSheetEntity } from './shift-sheet.entity';

@Entity('Shift')
export class ShiftEntity {
    @PrimaryGeneratedColumn({ name: 'shift_id' })
    shiftId: number;

    @Column({
        nullable: false,
    })
    day: Date;

    @Column({ nullable: false })
    shift: number;

    @ManyToOne(() => ShiftSheetEntity, (shiftSheet) => shiftSheet.shifts, {
        eager: false,
    })
    @JoinColumn({ name: 'shift_id' })
    shiftSheet: ShiftSheetEntity;
}
