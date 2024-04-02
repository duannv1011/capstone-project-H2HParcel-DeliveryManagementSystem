import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/role.decorator';
import { Role } from 'src/enum/roles.enum';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { OrderService } from './order.service';
import { UserLogin } from 'src/decorators/user_login.decorator';
import { UserLoginData } from 'src/module/core/authentication/dto/user_login_data';
import { CusCreateOrderDto } from '../dto/customer_create_order.dto';
import { CustomerEditOrder } from '../dto/custoemr-edit-order.dto';
import { CustomerCancelOrder } from '../dto/customer-cancel-order.dto';

@Controller('order')
@ApiTags('Order-api')
export class OrderController {
    constructor(private orderService: OrderService) {}
    @Get('customer/getAllOrders')
    @Roles(Role.CUSTOMER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'get All Customer Orders' })
    @ApiResponse({ status: 200, description: 'get All Customer Orders  successfully.' })
    async getAllOrders(@UserLogin() userLogin: UserLoginData, @Query('pageNo') pageNo: number) {
        return this.orderService.getAllOrders(userLogin.accId, pageNo);
    }
    @Get('customer/getOrderDetail')
    @Roles(Role.CUSTOMER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'get Order Detail Customer Orders' })
    @ApiResponse({ status: 200, description: 'get Order Detail Customer Orders  successfully.' })
    async getOrderDetail(@UserLogin() userLogin: UserLoginData, @Query('order_id') order_id: number) {
        return this.orderService.getDetailOrder(order_id, userLogin.accId);
    }
    @Put('customer/createOrder')
    @Roles(Role.CUSTOMER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'create new Order for Customer Orders' })
    @ApiResponse({ status: 200, description: 'create new Order for Customer  successfully.' })
    async createOrder(@Body() data: CusCreateOrderDto, @UserLogin() userLogin: UserLoginData) {
        return this.orderService.createOrder(data, userLogin.accId);
    }
    @Put('customer/edit-order')
    @Roles(Role.CUSTOMER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'send request to update Order for Customer Orders' })
    @ApiResponse({ status: 200, description: 'create new Order for Customer  successfully.' })
    async customeEditOrder(@Body() data: CustomerEditOrder, @UserLogin() userLogin: UserLoginData) {
        return this.orderService.customeEditOrder(data, userLogin.accId);
    }
    @Put('customer/cancel-order')
    @Roles(Role.CUSTOMER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'send request to cancel Order for Customer Orders' })
    @ApiResponse({ status: 200, description: 'create new Order for Customer  successfully.' })
    async customeCancelOrder(@Body() data: CustomerCancelOrder, @UserLogin() userLogin: UserLoginData) {
        return this.orderService.customeCancelOrder(data, userLogin.accId);
    }
}
