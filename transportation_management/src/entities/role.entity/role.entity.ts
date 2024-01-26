import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity('Role') // Specify your actual table name here
export class RoleEntity {
    @PrimaryGeneratedColumn()
    public role_id: number;

    @Column({ type: 'varchar' }) // Adjust the length as needed
    public role_name: string;
}
