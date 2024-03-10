import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/role.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import { Role } from 'src/enum/roles.enum';
import { AuthGuard } from 'src/guards/auth.guard';
import { Request } from 'express';
import { ExtractJwt } from 'passport-jwt';

@ApiTags('customer-api')
@Controller('customer')
export class CustomerController {
    constructor(private customerService: CustomerService) {}
    @Get('viewProfile')
    @Roles(Role.CUSTOMER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    viewCusProfile(@Req() request: Request): Promise<any> {
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
        return this.customerService.viewProfile(token);
    }
}
