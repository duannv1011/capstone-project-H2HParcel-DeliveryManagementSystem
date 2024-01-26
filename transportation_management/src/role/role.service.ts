import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleEntity } from 'src/entities/role.entity/role.entity';
import { Repository } from 'typeorm';
@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(RoleEntity)
        private rolesRepository: Repository<RoleEntity>,
    ) {}
    async getAllRoles() {
        return this.rolesRepository.find();
    }
}
