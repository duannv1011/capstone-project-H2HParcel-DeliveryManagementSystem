import { Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { StaffEntity } from './staff.entity';
import { ShiftEntity } from './shift.entity';

@Entity('ShiftSheet')
export class ShiftSheetEntity {
    @PrimaryGeneratedColumn({ name: 'sheet_id' })
    sheetId: number;

    @OneToMany(() => ShiftEntity, (shift) => shift.shiftSheet, { cascade: ['insert', 'update', 'remove'] })
    @JoinColumn({ name: 'shift_id' })
    shifts: ShiftEntity[];

    @ManyToOne(() => StaffEntity, (staff) => staff.shiftSheets)
    @JoinColumn({ name: 'staff_id' })
    staff: StaffEntity;
}
