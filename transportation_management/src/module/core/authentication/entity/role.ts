// role.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('Role')
export class RoleEntity {
    @PrimaryGeneratedColumn()
    role_id: number;

    @Column()
    role_name: string;
}
