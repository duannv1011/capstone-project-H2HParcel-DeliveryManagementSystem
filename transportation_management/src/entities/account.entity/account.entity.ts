import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { RoleEntity } from '../role.entity/role.entity';
@Entity('Account')
export class AccountEntity {
    @PrimaryGeneratedColumn()
    public acc_id: number;

    @Column()
    public username: string;

    @Column()
    public password: string;

    @Column()
    public role_id: number;

    @ManyToOne(() => RoleEntity, { eager: true })
    @JoinColumn({ name: 'role_id' })
    role: RoleEntity;

    @Column({ default: true })
    public isActive: boolean;
}
