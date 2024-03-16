import { Body, Controller, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/role.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import { Role } from 'src/enum/roles.enum';
import { AuthGuard } from 'src/guards/auth.guard';
import { Request } from 'express';
import { ExtractJwt } from 'passport-jwt';
import { updateCusProfileDto } from '../dto/update_profile_customer_dto';

@ApiTags('customer-api')
@Controller('customer')
export class CustomerController {
    constructor(private customerService: CustomerService) {}

    @Get('getAllCustomer:pageNo')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    async getAllCustomer(@Param('pageNo') pageNo: string): Promise<any> {
        return this.customerService.getAllCustomer(Number(pageNo), 2);
    }
    @Get('viewProfile')
    @Roles(Role.CUSTOMER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    async viewCusProfile(@Req() request: Request): Promise<any> {
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
        return this.customerService.viewProfile(token);
    }

    @Put('updateProfile')
    @Roles(Role.CUSTOMER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    async updateCusProfile(@Body() data: updateCusProfileDto, @Req() request: Request) {
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
        return this.customerService.updateProfile(data, token);
    }
}
