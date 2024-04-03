import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { RoleEntity } from './role.entity';
import { StaffEntity } from './staff.entity';
import { CustomerEntity } from './customer.entity';
import { AbstractEntity } from './abstract-entity';
@Entity('Account')
export class AccountEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({ name: 'acc_id' })
    public accId: number;

    @Column()
    public username: string;

    @Column()
    public password: string;

    @Column({ name: 'role_id', default: 1 })
    public roleId: number;

    @ManyToOne(() => RoleEntity, { eager: true })
    @JoinColumn({ name: 'role_id' })
    role: RoleEntity;

    @Column({ nullable: true, name: 'refresh_token' })
    refreshToken: string;

    @Column({ default: true })
    public isActive: boolean;

    @OneToMany(() => StaffEntity, (staff) => staff.account)
    @JoinColumn({ name: 'acc_id' })
    staffs: StaffEntity[];

    @OneToMany(() => CustomerEntity, (customer) => customer.account)
    @JoinColumn({ name: 'acc_id' })
    customers: CustomerEntity[];
}
