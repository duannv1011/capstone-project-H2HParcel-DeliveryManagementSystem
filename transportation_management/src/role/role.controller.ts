import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRole } from './dto/create-role/create-role';
import { UpdateRoleDto } from './dto/update-role-dto/update-role-dto';

@Controller('role')
export class RoleController {
    constructor(private readonly roleService: RoleService) {}
    @Get()
    async getAllRoles() {
        return this.roleService.getAllRoles();
    }
    @Get(':id')
    getRoleById(@Param('id') id: string) {
        return this.roleService.getRoleById(Number(id));
    }
    @Post()
    async createRole(@Body() data: CreateRole) {
        return this.roleService.createRole(data);
    }
    @Put(':id')
    async replaceRole(@Param('id') id: string, @Body() data: UpdateRoleDto) {
        return this.roleService.replaceRole(Number(id), data);
    }
    @Delete(':id')
    async deleteRole(@Param('id') id: string) {
        this.roleService.deleteRole(Number(id));
    }
}
