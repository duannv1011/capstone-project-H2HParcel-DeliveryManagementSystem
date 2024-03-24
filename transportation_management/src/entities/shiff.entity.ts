import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity('Shift')
export class ShiftEntity {
    @PrimaryGeneratedColumn()
    public shift_id: number;

    @Column()
    public day: Date;

    @Column()
    public shift: number;
}
