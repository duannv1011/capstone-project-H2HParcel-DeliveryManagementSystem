import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Body, Controller, Get, Post, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ShiftService } from './shift.service';
import { AuthGuard } from '../../../guards/auth.guard';
import { UserLogin } from '../../../decorators/user_login.decorator';
import { UserLoginData } from '../../core/authentication/dto/user_login_data';
import { Response } from '../../response/Response';
import { ShiftCreateArrayDto } from './dto/shift.create.dto';

@ApiTags('shift')
@Controller('shift')
export class ShiftController {
    constructor(private readonly shiftService: ShiftService) {}

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'View shift detail' })
    @UseGuards(AuthGuard)
    @ApiUnauthorizedResponse()
    @Get('detail')
    async findShiftDetail(@UserLogin() userLogin: UserLoginData): Promise<Response> {
        const shifts = await this.shiftService.getShiftSheetDetail(userLogin);

        return new Response(200, 'true', shifts, null, 1);
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'Search shift by date range' })
    @UseGuards(AuthGuard)
    @ApiUnauthorizedResponse()
    @Get('search')
    async searchStaffByDate(
        @UserLogin() userLogin: UserLoginData,
        @Query('from') from: string,
        @Query('to') to: string,
    ): Promise<Response> {
        const shifts = await this.shiftService.searchStaffByDate(userLogin, from, to);

        return new Response(200, 'true', shifts, null, 1);
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'Create shift' })
    @UseGuards(AuthGuard)
    @UsePipes(ValidationPipe)
    @ApiUnauthorizedResponse()
    @ApiBody({ type: ShiftCreateArrayDto })
    @Post('create')
    async updateOrderStatus(@Body() request: ShiftCreateArrayDto): Promise<Response> {
        const result = await this.shiftService.createShift(request);
        if (result) {
            return new Response(201, 'success', result, null, 1);
        }

        return new Response(200, 'false', false, null, 1);
    }
}
