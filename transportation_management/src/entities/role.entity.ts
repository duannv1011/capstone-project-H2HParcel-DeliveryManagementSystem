import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Role')
export class RoleEntity {
    @PrimaryGeneratedColumn({ name: 'role_id' })
    public roleId: number;

    @Column({ name: 'role_name', type: 'varchar' })
    public roleName: string;
}
