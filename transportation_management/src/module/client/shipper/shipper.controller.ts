import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ShipperService } from './shipper.service';
import { Roles } from 'src/decorators/role.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from 'src/enum/roles.enum';
import { UserLogin } from 'src/decorators/user_login.decorator';
import { UserLoginData } from 'src/module/core/authentication/dto/user_login_data';

@Controller('shipper')
@ApiTags('shipper-api')
export class ShipperController {
    constructor(private readonly shipperService: ShipperService) {}

    @Get('shipper/orders')
    @Roles(Role.SHIPPER)
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard, RoleGuard)
    @ApiOperation({ summary: 'get All Orders of shipper' })
    @ApiResponse({ status: 200, description: 'get All Customer Orders  successfully.' })
    async getAllorder(@Query('pageNo') pageNo: number, @UserLogin() uselogin: UserLoginData): Promise<any> {
        return await this.shipperService.findAllOrder(pageNo, Number(uselogin.accId));
    }
    @Get('shippers')
    @Roles(Role.MANAGER, Role.STAFF)
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard, RoleGuard)
    @ApiOperation({ summary: 'get All Avalable Shiper to asign to Order' })
    @ApiResponse({ status: 200, description: 'get All Customer Orders  successfully.' })
    async getshipperToAsign(@UserLogin() uselogin: UserLoginData): Promise<any> {
        return await this.shipperService.getshipperToAsign(Number(uselogin.accId));
    }
    @Get('shipper/order-details')
    @Roles(Role.SHIPPER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'get Detail of Orders by shipper' })
    @ApiResponse({ status: 200, description: 'get Detail Orders  successfully.' })
    async getOrderDetail(@Query('order_id') order_id: number) {
        return this.shipperService.getDetailOrder(order_id);
    }
    @Get('shipper/order/finish-order')
    @Roles(Role.SHIPPER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'shipper take photo confirm then completed order' })
    @ApiResponse({ status: 200, description: 'successfully.' })
    async finishOrder(@Query('order_id') order_id: number) {
        return this.shipperService.finishOrder(order_id);
    }
}
