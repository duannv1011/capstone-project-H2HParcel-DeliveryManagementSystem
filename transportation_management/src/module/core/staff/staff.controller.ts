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
import { Response } from '../../response/Response';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { StaffProfileUpdateDto } from '../../../shared/dto/profile/staff_profile.update.dto';
import { Roles } from '../../../decorators/role.decorator';
import { Role } from '../../../enum/roles.enum';
import { AuthGuard } from '../../../guards/auth.guard';
import { RoleGuard } from '../../../guards/role.guard';
import { UserLogin } from '../../../decorators/user_login.decorator';
import { UserLoginData } from '../authentication/dto/user_login_data';
import { RequestCreateDto } from '../../../shared/dto/request/request.create.dto';
import { RequestUpdateDto } from '../../../shared/dto/request/request.update.dto';
import { ProfileService } from '../../../shared/service/profile.service';
import { RequestService } from '../../../shared/service/request.service';

@ApiTags('staff')
@Controller('staff')
export class StaffController {
    constructor(
        private readonly profileService: ProfileService,
        private readonly requestService: RequestService,
    ) {}

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'Get staff profile' })
    @Roles(Role.STAFF)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @Get('profile')
    async getProfile(@UserLogin() userLogin: UserLoginData): Promise<Response> {
        const profile = await this.profileService.findOneStaffByAccId(userLogin.accId);

        return new Response(200, 'success', profile, null, 1);
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'Update staff profile' })
    @Roles(Role.STAFF)
    @UseGuards(AuthGuard, RoleGuard)
    @UsePipes(ValidationPipe)
    @ApiUnauthorizedResponse()
    @ApiBody({ type: StaffProfileUpdateDto })
    @Post('profile/update')
    async updateProfile(@Body() request: StaffProfileUpdateDto): Promise<Response> {
        const result = await this.profileService.updateStaffProfile(request);

        if (result) {
            return new Response(201, 'success', result, null, 1);
        }

        return new Response(200, 'false', null, null, 1);
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'View all request' })
    @Roles(Role.STAFF)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @Get('request')
    async findAll(@Query('orderId', ParseIntPipe) orderId: number): Promise<Response> {
        const requestList = await this.requestService.findAllRequest(orderId);

        return new Response(200, 'true', requestList, null, 1);
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'View request detail' })
    @Roles(Role.STAFF)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @Get('request/detail')
    async findOne(
        @Query('requestId', ParseIntPipe) requestId: number,
        @UserLogin() user: UserLoginData,
    ): Promise<Response> {
        console.log(user);
        const request = await this.requestService.findRequestDetail(requestId);

        return new Response(200, 'true', request, null, 1);
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'Create staff request' })
    @Roles(Role.STAFF)
    @UseGuards(AuthGuard, RoleGuard)
    @UsePipes(ValidationPipe)
    @ApiUnauthorizedResponse()
    @ApiBody({ type: RequestCreateDto })
    @Post('request')
    async createRequest(@Body() request: RequestCreateDto): Promise<Response> {
        const requestNew = await this.requestService.createRequest(request);
        if (requestNew) {
            return new Response(201, 'success', requestNew, null, 1);
        }

        return new Response(200, 'false', null, null, 1);
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'Update staff request' })
    @Roles(Role.STAFF)
    @UseGuards(AuthGuard, RoleGuard)
    @UsePipes(ValidationPipe)
    @ApiUnauthorizedResponse()
    @ApiBody({ type: RequestUpdateDto })
    @Post('request/update')
    async updateRequest(@Body() request: RequestUpdateDto): Promise<Response> {
        const requestUpdate = await this.requestService.updateRequest(request);
        if (requestUpdate) {
            return new Response(201, 'success', requestUpdate, null, 1);
        }

        return new Response(200, 'false', false, null, 1);
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'Cancel staff request' })
    @Roles(Role.STAFF)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiUnauthorizedResponse()
    @UsePipes(ValidationPipe)
    @Put('request/cancel')
    async cancelRequest(@Query('requestId', ParseIntPipe) requestId: number): Promise<Response> {
        const requestCancel = await this.requestService.cancelRequest(requestId);
        if (requestCancel) {
            return new Response(201, 'success', requestCancel, null, 1);
        }

        return new Response(200, 'false', requestCancel, null, 1);
    }
}
