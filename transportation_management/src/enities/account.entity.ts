import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { RoleEntity } from './role.entity';
import { AbstractEntity } from './abstract-entity';
@Entity('Account')
export class AccountEntity extends AbstractEntity {
    @PrimaryGeneratedColumn()
    public acc_id: number;

    @Column()
    public username: string;

    @Column()
    public password: string;

    @Column({ default: 1 })
    public role_id: number;

    @ManyToOne(() => RoleEntity, { eager: true })
    @JoinColumn({ name: 'role_id' })
    role: RoleEntity;

    @Column({ nullable: true })
    refresh_token: string;

    @Column({ default: true })
    public isActive: boolean;
}
