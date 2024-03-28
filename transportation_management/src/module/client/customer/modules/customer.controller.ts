import { Body, Controller, Get, Patch, Put, Query, Req, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/role.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import { Role } from 'src/enum/roles.enum';
import { AuthGuard } from 'src/guards/auth.guard';
import { Request } from 'express';
import { ExtractJwt } from 'passport-jwt';
import { updateCusProfileDto } from '../dto/update_profile_customer_dto';
import { ConfigService } from '@nestjs/config';
import { CustomerStatusUpdateDTO } from 'src/module/web/admin/dto/customer-status-update.dto';

@ApiTags('customer-api')
@Controller('customer')
export class CustomerController {
    constructor(
        private customerService: CustomerService,
        private configService: ConfigService,
    ) {}
    @Get('getAllCustomer')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'get All Customer' })
    @ApiResponse({ status: 200, description: 'get All Customer successfully.' })
    async getAllCustomer(@Query('pageNo') pageNo: string): Promise<any> {
        const pagesize = this.configService.get<string>('PAGE_SIZE');
        return this.customerService.getAllCustomer(Number(pageNo), Number(pagesize));
    }
    @Patch('updateCustomerStatus')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Update customer status' })
    @ApiResponse({ status: 200, description: 'Updated customer status successfully.' })
    async updateCustomerStatus(@Body() customerStatusUpdateDTO: CustomerStatusUpdateDTO): Promise<any> {
        return await this.customerService.updateCustomerStatus(
            customerStatusUpdateDTO.cus_id,
            customerStatusUpdateDTO.status,
        );
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
