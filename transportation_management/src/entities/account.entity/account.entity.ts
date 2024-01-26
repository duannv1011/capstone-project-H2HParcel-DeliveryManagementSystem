import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('account')
export class AccountEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ default: true })
    isActive: boolean;
}
