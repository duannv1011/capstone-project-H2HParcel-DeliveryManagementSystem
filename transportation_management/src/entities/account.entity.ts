import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { RoleEntity } from './role.entity';
import { AbstractEntity } from './abstract-entity';
import { StaffEntity } from './staff.entity';
import { CustomerEntity } from './customer.entity';
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

    @OneToMany(() => StaffEntity, (staff) => staff.account)
    @JoinColumn({ name: 'acc_id' })
    staffs: StaffEntity[];

    @OneToMany(() => CustomerEntity, (customer) => customer.account)
    @JoinColumn({ name: 'acc_id' })
    customers: CustomerEntity[];
}
