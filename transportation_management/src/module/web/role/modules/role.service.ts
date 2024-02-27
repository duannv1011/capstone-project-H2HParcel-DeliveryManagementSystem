import { NotFoundException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoleDto } from '../dto/create-role-dto/create-role-dto';
import { UpdateRoleDto } from '../dto/update-role-dto/update-role-dto';
import { RoleEntity } from '../entity/role';
@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(RoleEntity)
        private rolesRepository: Repository<RoleEntity>,
    ) {}

    async getAllRoles() {
        const [roles, count] = await this.rolesRepository.findAndCount({
            order: {
                role_id: 'ASC',
            },
        });

        if (roles && roles.length > 0) {
            return { roles, count };
        } else {
            return 'List of roles is empty';
        }
    }
    async getRoleById(id: number) {
        const role = await this.rolesRepository.findOne({
            where: { role_id: id },
        });

        if (role) {
            return role;
        } else {
            throw new NotFoundException('Role not found');
        }
    }

    async createRole(data: CreateRoleDto) {
        try {
            const existingRole = await this.rolesRepository.findOne({
                where: { role_name: data.role_name },
            });

            if (existingRole) {
                return {
                    success: false,
                    error: 'Role with the same name already exists',
                };
            }
            const newRole = new RoleEntity();
            newRole.role_name = data.role_name;
            await this.rolesRepository.save(newRole);
            return newRole;
        } catch (error) {
            console.error('Role creation failed:', error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async replaceRole(id: number, data: UpdateRoleDto) {
        try {
            const existingRole = await this.rolesRepository.findOne({
                where: { role_id: id },
            });
            if (existingRole) {
                if (id === data.role_id || data.role_id === undefined) {
                    const existingRole = await this.rolesRepository.findOne({
                        where: { role_name: data.role_name },
                    });
                    if (existingRole) {
                        return {
                            success: false,
                            error: 'Role with the same name already exists',
                        };
                    }
                    await this.rolesRepository.update(id, data);
                    const updatedRolse = await this.rolesRepository.findOne({
                        where: { role_id: id },
                    });
                    if (updatedRolse) {
                        return updatedRolse;
                    }
                } else {
                    return {
                        success: false,
                        error: 'old roleId and new roleId is not match',
                    };
                }
            } else {
                throw new NotFoundException('Role not found to update');
            }
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Role update failed',
            };
        }
    }
    async deleteRole(id: number) {
        try {
            // const existingRole = await this.rolesRepository.findOne({
            //     where: { role_id: id },
            // });
            // if (!existingRole) {
            //     console.log('return');
            //     return {
            //         success: false,
            //         error: 'Role not found to update',
            //     };
            // }
            const deleteResponse = await this.rolesRepository.delete(id);
            if (!deleteResponse.affected) {
                throw new HttpException(`Role with ID ${id} not found`, HttpStatus.NOT_FOUND);
            }
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Role delete failed',
            };
        }
    }
}
