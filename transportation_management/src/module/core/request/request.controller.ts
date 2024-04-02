import {
    Body,
    Controller,
    Get,
    ParseIntPipe,
    Post,
    Put,
    Query,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { RequestService } from './request.service';
import { AuthGuard } from '../../../guards/auth.guard';
import { Response } from '../../response/Response';
import { Roles } from '../../../decorators/role.decorator';
import { Role } from '../../../enum/roles.enum';
import { RoleGuard } from '../../../guards/role.guard';
import { RequestUpdateDto } from './dto/request.update.dto';
import { UpdateOrderCustomer } from './dto/customer_update_order.dto';
import { UserLogin } from 'src/decorators/user_login.decorator';
import { UserLoginData } from '../authentication/dto/user_login_data';

@ApiTags('request')
@Controller('request')
export class RequestController {
    constructor(private readonly requestService: RequestService) {}

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'View all request of deliver order, request type in 1,2' })
    @ApiOperation({ summary: 'View all request of deliver order, request type in 1,2' })
    @Roles(Role.STAFF, Role.MANAGER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @Get('all')
    async findRequestByOrder(@Query('pageNo', ParseIntPipe) pageNo: number): Promise<Response> {
        const request = await this.requestService.findRequestByOrder(pageNo);

        return new Response(200, 'true', request.records, request.paging, 1);
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'View request record detail' })
    @ApiOperation({ summary: 'View request record detail' })
    @Roles(Role.STAFF, Role.MANAGER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @Get('detail')
    async findOne(@Query('recordId', ParseIntPipe) recordId: number): Promise<Response> {
        const request = await this.requestService.findRequestRecordDetail(recordId);

        return new Response(200, 'true', request, null, 1);
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'Update request' })
    @ApiOperation({ summary: 'Update request' })
    @Roles(Role.STAFF, Role.MANAGER)
    @UseGuards(AuthGuard, RoleGuard)
    @UsePipes(ValidationPipe)
    @ApiUnauthorizedResponse()
    @ApiBody({ type: RequestUpdateDto })
    @Post('update')
    async updateRequest(@Body() request: RequestUpdateDto): Promise<Response> {
        const requestUpdate = await this.requestService.updateRequest(request);

        return new Response(201, 'success', requestUpdate, null, 1);
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'Cancel staff request' })
    @ApiOperation({ summary: 'Cancel staff request' })
    @Roles(Role.STAFF, Role.MANAGER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @UsePipes(ValidationPipe)
    @Put('cancel')
    async cancelRequest(@Query('recordId', ParseIntPipe) recordId: number): Promise<Response> {
        const requestCancel = await this.requestService.cancelRequest(recordId);

        return new Response(200, 'true', requestCancel, null, 1);
    }
 
    @Put('updateOrder')
    @Roles(Role.CUSTOMER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'update Order for Customer' })
    @ApiResponse({ status: 200, description: 'update Order for Customer  successfully.' })
    async updateOrder(@Body() data: UpdateOrderCustomer, @UserLogin() userLogin: UserLoginData) {
        return this.requestService.updateOrder(data, Number(userLogin.accId));
    }
}
