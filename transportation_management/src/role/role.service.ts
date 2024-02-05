import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleEntity } from 'src/entities/role.entity/role.entity';
import { Repository } from 'typeorm';
import { CreateRole } from './dto/create-role/create-role';
import { UpdateRoleDto } from './dto/update-role-dto/update-role-dto';
@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(RoleEntity)
        private rolesRepository: Repository<RoleEntity>,
    ) {}

    async getAllRoles() {
        const roles = await this.rolesRepository.findAndCount();
        return roles ? roles : 'List of roles is empty';
    }
    async getRoleById(id: number) {
        const role = await this.rolesRepository.findOne({
            where: { role_id: id },
        });

        return role ? role : 'Role not found';
    }

    async createRole(data: CreateRole) {
        try {
            const newRole = await this.rolesRepository.create(data);
            await this.rolesRepository.save(newRole);
            return newRole;
        } catch (error) {
            console.error('Role creation failed:', error.message);
            return { success: false, error: 'Role creation failed' };
        }
    }
    async replaceRole(id: number, data: UpdateRoleDto) {
        await this.rolesRepository.update(id, data);
        const updatedRolse = await this.rolesRepository.findOne({
            where: { role_id: id },
        });
        if (updatedRolse) {
            return updatedRolse;
        }
        throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    async deleteRole(id: number) {
        const deleteResponse = await this.rolesRepository.delete(id);
        if (!deleteResponse.affected) {
            throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
        }
    }
}
