import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('RequestRecord')
export class RequestRecordEntity {
    @PrimaryGeneratedColumn()
    public record_id: number;

    @Column()
    public refer_id: number;

    @Column()
    public request_type: number;

    @Column()
    public request_stt: number;

    @Column({ type: 'varchar' })
    public note: string;
}
