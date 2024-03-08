import { Body, Controller, Delete, Get, Param, Post, Put, UseFilters } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ExceptionsLoggerFilter } from 'src/utils/exceptions-logger-filter/exceptions-logger-filter';
import { RoleService } from './role.service';
import { CreateRoleDto } from '../dto/create-role-dto/create-role-dto';
import { UpdateRoleDto } from '../dto/update-role-dto/update-role-dto';
@ApiTags('role-api')
@Controller('role')
export class RoleController {
    constructor(private readonly roleService: RoleService) {}
    @Get('getAll')
    async getAllRoles() {
        return this.roleService.getAllRoles();
    }
    @Get('getOne:id')
    @UseFilters(ExceptionsLoggerFilter)
    getRoleById(@Param('id') id: string) {
        return this.roleService.getRoleById(Number(id));
    }
    @Post('create')
    async createRole(@Body() data: CreateRoleDto) {
        return this.roleService.createRole(data);
    }
    @Put('update:id')
    async replaceRole(@Param('id') id: string, @Body() data: UpdateRoleDto) {
        return this.roleService.replaceRole(Number(id), data);
    }
    @Delete('delete:id')
    async deleteRole(@Param('id') id: string) {
        this.roleService.deleteRole(Number(id));
    }
}
