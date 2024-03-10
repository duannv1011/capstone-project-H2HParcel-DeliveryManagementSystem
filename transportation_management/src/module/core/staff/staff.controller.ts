import { Body, Controller, Get, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ProfileService } from '../../../shared/profile.service';
import { Response } from '../../response/Response';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { StaffProfileUpdateDto } from './dto/staff_profile_update.dto';
import { Roles } from '../../../decorators/role.decorator';
import { Role } from '../../../enum/roles.enum';
import { AuthGuard } from '../../../guards/auth.guard';
import { RoleGuard } from '../../../guards/role.guard';
import { UserLogin } from '../../../decorators/user_login.decorator';
import { UserLoginData } from '../authentication/dto/user_login_data';

@ApiTags('staff')
@Controller('staff')
export class StaffController {
    constructor(private readonly profileService: ProfileService) {}

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'Get staff profile' })
    @Roles(Role.STAFF)
    @UseGuards(AuthGuard)
    @Get('profiles')
    async getProfile(@UserLogin() userLogin: UserLoginData): Promise<Response> {
        const profile = await this.profileService.findOneStaffByAccId(userLogin.accId);

        return new Response(200, 'success', profile, null, 1);
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'Update staff profile' })
    @Roles(Role.STAFF)
    @UseGuards(AuthGuard, RoleGuard)
    @UsePipes(ValidationPipe)
    @Post('profiles/update')
    async updateProfile(@Body() request: StaffProfileUpdateDto): Promise<Response> {
        const result = await this.profileService.updateStaffProfile(request);

        if (result) {
            return new Response(201, 'success', result, null, 1);
        }

        return new Response(200, 'false', null, null, 1);
    }
}
