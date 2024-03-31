import { Controller, Get, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { RequestService } from './request.service';
import { AuthGuard } from '../../../guards/auth.guard';
import { Response } from '../../response/Response';
import { Roles } from '../../../decorators/role.decorator';
import { Role } from '../../../enum/roles.enum';
import { RoleGuard } from '../../../guards/role.guard';
import { UserLogin } from '../../../decorators/user_login.decorator';
import { UserLoginData } from '../authentication/dto/user_login_data';

@ApiTags('request')
@Controller('request')
export class RequestController {
    constructor(private readonly requestService: RequestService) {}

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'View all request of deliver order, request type in 1,2' })
    @ApiOperation({ summary: 'View all request of deliver order, request type in 1,2' })
    @Roles(Role.STAFF)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @Get('order')
    async findRequestByOrder(
        @Query('orderId', ParseIntPipe) orderId: number,
        @Query('pageNo', ParseIntPipe) pageNo: number,
    ): Promise<Response> {
        const request = await this.requestService.findRequestByOrder(orderId, pageNo);

        return new Response(200, 'true', request.records, request.paging, 1);
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'View all request of transit order, request type 3' })
    @ApiOperation({ summary: 'View all request of transit order, request type 3' })
    @Roles(Role.STAFF)
    @UseGuards(AuthGuard, RoleGuard)
    @UseGuards(AuthGuard)
    @ApiUnauthorizedResponse()
    @Get('transit')
    async findTransitByStaff(
        @UserLogin() userLogin: UserLoginData,
        @Query('pageNo', ParseIntPipe) pageNo: number,
    ): Promise<Response> {
        const request = await this.requestService.findTransitByStaff(userLogin, pageNo);

        return new Response(200, 'true', request.records, request.paging, 1);
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'View request record detail' })
    @ApiOperation({ summary: 'View request record detail' })
    @Roles(Role.STAFF)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @Get('detail')
    async findOne(@Query('recordId', ParseIntPipe) recordId: number): Promise<Response> {
        const request = await this.requestService.findRequestRecordDetail(recordId);

        return new Response(200, 'true', request, null, 1);
    }

    // @ApiBearerAuth('JWT-auth')
    // @ApiOkResponse({ description: 'Create staff request' })
    // @ApiOperation({ summary: 'View order detail by range time' })
    // // @UseGuards(AuthGuard)
    // @UsePipes(ValidationPipe)
    // @ApiUnauthorizedResponse()
    // @ApiBody({ type: RequestCreateDto })
    // @Post('')
    // async createRequest(@Body() request: RequestCreateDto): Promise<Response> {
    //     const requestNew = await this.requestService.createRequest(request);
    //     if (requestNew) {
    //         return new Response(201, 'success', requestNew, null, 1);
    //     }
    //
    //     return new Response(200, 'false', null, null, 1);
    // }

    // @ApiBearerAuth('JWT-auth')
    // @ApiOkResponse({ description: 'Update staff request' })
    // @ApiOperation({ summary: 'View order detail by range time' })
    // @Roles(Role.STAFF)
    // @UseGuards(AuthGuard, RoleGuard)
    // @UsePipes(ValidationPipe)
    // @ApiUnauthorizedResponse()
    // @ApiBody({ type: RequestUpdateDto })
    // @Post('update')
    // async updateRequest(@Body() request: RequestUpdateDto): Promise<Response> {
    //     const requestUpdate = await this.requestService.updateRequest(request);
    //     if (requestUpdate) {
    //         return new Response(201, 'success', requestUpdate, null, 1);
    //     }
    //
    //     return new Response(200, 'false', false, null, 1);
    // }
    //
    // @ApiBearerAuth('JWT-auth')
    // @ApiOkResponse({ description: 'Cancel staff request' })
    // @ApiOperation({ summary: 'View order detail by range time' })
    // @Roles(Role.STAFF)
    // @UseGuards(AuthGuard, RoleGuard)
    // @ApiUnauthorizedResponse()
    // @UsePipes(ValidationPipe)
    // @Put('cancel')
    // async cancelRequest(@Query('requestId', ParseIntPipe) requestId: number): Promise<Response> {
    //     const requestCancel = await this.requestService.cancelRequest(requestId);
    //     if (requestCancel) {
    //         return new Response(201, 'success', requestCancel, null, 1);
    //     }
    //
    //     return new Response(200, 'false', requestCancel, null, 1);
    // }
}
