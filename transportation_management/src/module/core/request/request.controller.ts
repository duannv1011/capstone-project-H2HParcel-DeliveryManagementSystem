import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RequestService } from './request.service';
import { AuthGuard } from '../../../guards/auth.guard';
import { Response } from '../../response/Response';
import { Roles } from '../../../decorators/role.decorator';
import { Role } from '../../../enum/roles.enum';
import { RoleGuard } from '../../../guards/role.guard';
import { RequestUpdateDto } from './dto/request.update.dto';
import { StaffUpdateRequestStastus } from './dto/staff-reslove-order-update';
import { UserLogin } from 'src/decorators/user_login.decorator';
import { UserLoginData } from '../authentication/dto/user_login_data';
import { createTransitRequestDto } from './dto/staff-create-transit.dto';

@ApiTags('request')
@Controller('request')
export class RequestController {
    constructor(private readonly requestService: RequestService) {}
    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'get all request of warehouse successfully' })
    @ApiOperation({ summary: 'get all request of warehouse ' })
    @Roles(Role.STAFF, Role.MANAGER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @Get('staff/requests-staff')
    async getAllReqeustByWarehouseId(@Query('pageNo') pageNo: number, @UserLogin() user: UserLoginData) {
        return await this.requestService.getAllReqeustByWarehouseId(pageNo, Number(user.accId));
    }
    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'get all request of warehouse successfully' })
    @ApiOperation({ summary: 'get all request of warehouse ' })
    @Roles(Role.STAFF, Role.MANAGER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @ApiQuery({ name: 'requestType', required: false, type: Number })
    @ApiQuery({ name: 'requestStatus', required: false, type: Number })
    @Get('staff/requests-staff/requests-search')
    async getAllReqeustByWarehouseIdSearch(
        @Query('pageNo') pageNo: number,
        @UserLogin() user: UserLoginData,
        @Query('requestStatus') requestStatus: number,
        @Query('requestType') requestType: number,
    ) {
        requestStatus = requestStatus ? requestStatus : 0;

        requestType = requestType ? requestType : 0;
        return await this.requestService.getAllReqeustByWarehouseIdSearch(
            pageNo,
            Number(user.accId),
            Number(requestStatus),
            Number(requestType),
        );
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

    @Put('request/staff/order-update')
    @Roles(Role.STAFF, Role.MANAGER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'staff reslove request for order of Customer' })
    @ApiResponse({ status: 200, description: 'update Order for Customer  successfully.' })
    async resloveOrder(@Body() data: StaffUpdateRequestStastus, @UserLogin() userLogin: UserLoginData) {
        return this.requestService.resloveOrder(data, Number(userLogin.accId));
    }
    @Post('request-create/transit')
    @Roles(Role.MANAGER, Role.STAFF)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'create transit reqest' })
    @ApiResponse({ status: 200, description: 'update Order for Customer  successfully.' })
    async createTransitRequest(@Body() data: createTransitRequestDto, @UserLogin() userLogin: UserLoginData) {
        return this.requestService.createTransitRequest(data, Number(userLogin.accId));
    }
    @Post('transit-update/request-status')
    @Roles(Role.SHIPPER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'update transit status ' })
    @ApiResponse({ status: 200, description: 'update successfully.' })
    async transitUpdateStatus(@Param('request_id') request_id: number) {
        return this.requestService.transitUpdateStatus(request_id);
    }
}
