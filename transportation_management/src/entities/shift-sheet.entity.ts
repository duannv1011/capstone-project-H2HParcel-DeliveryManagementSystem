import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity('ShiftSheet')
export class ShiftSheetEntity {
    @PrimaryGeneratedColumn()
    public sheet_id: number;

    @Column()
    public shift_id: number;

    @Column()
    public staff_id: number;
}
