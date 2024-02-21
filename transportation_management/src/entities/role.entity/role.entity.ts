import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity('Role')
export class RoleEntity {
    @PrimaryGeneratedColumn()
    public role_id: number;

    @Column({ type: 'varchar' })
    public role_name: string;
}
