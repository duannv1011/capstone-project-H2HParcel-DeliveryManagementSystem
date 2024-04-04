import { Body, Controller, Get, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/role.decorator';
import { Role } from 'src/enum/roles.enum';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { OrderService } from './order.service';
import { UserLogin } from 'src/decorators/user_login.decorator';
import { UserLoginData } from 'src/module/core/authentication/dto/user_login_data';
import { CusCreateOrderDto } from '../dto/customer-create-order.dto';
import { CustomerEditOrder } from '../dto/custoemr-edit-order.dto';
import { CustomerCancelOrder } from '../dto/customer-cancel-order.dto';
import { CaculataOrderPrice } from '../dto/caculate-order-price.dto';
import { asignShipperDto } from '../dto/asing-shipper-order.dto';

@Controller('order')
@ApiTags('Order-api')
export class OrderController {
    constructor(private orderService: OrderService) {}
    @Get('customer-order/orders')
    @Roles(Role.CUSTOMER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'get All Customer Orders' })
    @ApiResponse({ status: 200, description: 'get All Customer Orders  successfully.' })
    async getAllOrders(@UserLogin() userLogin: UserLoginData, @Query('pageNo') pageNo: number) {
        return this.orderService.getAllOrders(userLogin.accId, pageNo);
    }
    @Get('customer-order/order-detail')
    @Roles(Role.CUSTOMER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'get Order Detail Customer Orders' })
    @ApiResponse({ status: 200, description: 'get Order Detail Customer Orders  successfully.' })
    async getOrderDetail(@UserLogin() userLogin: UserLoginData, @Query('order_id') order_id: number) {
        return this.orderService.getDetailOrder(order_id, userLogin.accId);
    }
    @Put('customer-order/order')
    @Roles(Role.CUSTOMER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'create new Order for Customer Orders' })
    @ApiResponse({ status: 200, description: 'create new Order for Customer  successfully.' })
    async createOrder(@Body() data: CusCreateOrderDto, @UserLogin() userLogin: UserLoginData) {
        return this.orderService.createOrder(data, userLogin.accId);
    }
    @Put('customer-order/update-order')
    @Roles(Role.CUSTOMER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'send request to update Order for Customer Orders' })
    @ApiResponse({ status: 200, description: 'create new Order for Customer  successfully.' })
    async customeEditOrder(@Body() data: CustomerEditOrder, @UserLogin() userLogin: UserLoginData) {
        return this.orderService.customeEditOrder(data, userLogin.accId);
    }
    @Put('customer-order/cancel-order')
    @Roles(Role.CUSTOMER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'send request to cancel Order for Customer Orders' })
    @ApiResponse({ status: 200, description: 'create new Order for Customer  successfully.' })
    async customeCancelOrder(@Body() data: CustomerCancelOrder, @UserLogin() userLogin: UserLoginData) {
        return this.orderService.customeCancelOrder(data, userLogin.accId);
    }
    @Post('customer-order/calculate-order-price')
    @Roles(Role.CUSTOMER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'send request to cancel Order for Customer Orders' })
    @ApiResponse({ status: 200, description: 'create new Order for Customer  successfully.' })
    async caculateOrderPrice(@Body() data: CaculataOrderPrice) {
        return this.orderService.caculateOrderPrice(data);
    }
    @Put('customer-order/quick-update-order')
    @Roles(Role.MANAGER, Role.STAFF)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'asign Shipper To Order ' })
    @ApiResponse({ status: 200, description: 'asign Shipper To Orde  successfully.' })
    async asignShipperToOrder(@Body() data: asignShipperDto) {
        return this.orderService.asignShipperToOrder(data);
    }
}
