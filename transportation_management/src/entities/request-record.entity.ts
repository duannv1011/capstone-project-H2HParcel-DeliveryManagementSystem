import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('RequestRecord')
export class RequestRecordEntity {
    @PrimaryGeneratedColumn()
    public record_id: number;

    @Column()
    public refer_id: number;

    @Column({ type: 'varchar' })
    public request_type: string;

    @Column({ type: 'varchar' })
    public request_stt: string;

    @Column({ type: 'varchar' })
    public note: string;
}
