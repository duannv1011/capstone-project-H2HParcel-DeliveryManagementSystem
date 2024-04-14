import { Controller, Get, ParseIntPipe, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ShipperService } from './shipper.service';
import { Roles } from 'src/decorators/role.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from 'src/enum/roles.enum';
import { UserLogin } from 'src/decorators/user_login.decorator';
import { UserLoginData } from 'src/module/core/authentication/dto/user_login_data';
import { Response } from '../../response/Response';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('shipper')
@ApiTags('shipper-api')
export class ShipperController {
    constructor(private readonly shipperService: ShipperService) {}
    @Get('shipper/payslip')
    @Roles(Role.SHIPPER)
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard, RoleGuard)
    @ApiOperation({ summary: 'get Payslip of shipper' })
    @ApiResponse({ status: 200, description: 'get  Payslip  of Shipper successfully.' })
    async getShiperPayslip(@UserLogin() uselogin: UserLoginData): Promise<any> {
        return await this.shipperService.getShiperPayslip(Number(uselogin.accId));
    }
    @Get('shipper/orders')
    @Roles(Role.SHIPPER)
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard, RoleGuard)
    @ApiOperation({ summary: 'get All Orders of shipper' })
    @ApiResponse({ status: 200, description: 'get All Customer Orders  successfully.' })
    async getAllorder(@Query('pageNo') pageNo: number, @UserLogin() uselogin: UserLoginData): Promise<any> {
        return await this.shipperService.findAllOrder(pageNo, Number(uselogin.accId));
    }
    @Get('shipper/orders-search')
    @Roles(Role.SHIPPER)
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard, RoleGuard)
    @ApiOperation({ summary: 'get All Orders of shipper and search' })
    @ApiResponse({ status: 200, description: 'search All Customer Orders  successfully.' })
    // @ApiQuery({ name: 'seachValue', required: false, type: String })
    @ApiQuery({ name: 'orderStatus', required: false, type: Number })
    async getAllorderSearch(
        @Query('pageNo') pageNo: number,
        @UserLogin() uselogin: UserLoginData,
        // @Query('seachValue') seachValue: string,
        @Query('orderStatus') orderStatus: number,
    ): Promise<any> {
        // seachValue = seachValue ? seachValue : '';
        orderStatus = orderStatus ? orderStatus : 0;
        return await this.shipperService.getAllorderSearch(pageNo, Number(uselogin.accId), orderStatus);
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
    @Put('shipper/order/update-price')
    @Roles(Role.SHIPPER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'get Detail of Orders by shipper' })
    @ApiResponse({ status: 200, description: 'get Detail Orders  successfully.' })
    async shiperUpdateprice(@Query('order_id') order_id: number, @Query('price') price: number) {
        return this.shipperService.shiperUpdateprice(order_id, price);
    }
    @Put('shipper/order/order-cancel')
    @Roles(Role.SHIPPER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'shipper Cancel Order of Orders by shipper' })
    @ApiResponse({ status: 200, description: 'Cancel  successfully.' })
    async shiperOrderCancel(@Query('order_id') order_id: number, @UserLogin() user: UserLoginData) {
        return this.shipperService.shiperCancelOrder(order_id, user.accId);
    }
    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'Upload verify image order to google driver' })
    @ApiOperation({ summary: 'Upload verify image order to google driver' })
    @Roles(Role.SHIPPER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @Put('image-upload')
    @UseInterceptors(FileInterceptor('file'))
    async imageUpload(
        @UploadedFile() file: Express.Multer.File,
        @Query('orderId', ParseIntPipe) orderId: number,
        @UserLogin() user: UserLoginData,
    ): Promise<Response> {
        const result = await this.shipperService.imageUpload(file, orderId, Number(user.accId));
        return new Response(200, 'success', result);
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
