import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Post,
    Query,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { Response } from '../../response/Response';
import { StaffProfileUpdateDto } from '../../../shared/dto/profile/staff_profile.update.dto';
import { Roles } from '../../../decorators/role.decorator';
import { Role } from '../../../enum/roles.enum';
import { AuthGuard } from '../../../guards/auth.guard';
import { RoleGuard } from '../../../guards/role.guard';
import { ProfileService } from '../../../shared/service/profile.service';
import { UserLogin } from '../../../decorators/user_login.decorator';
import { UserLoginData } from '../authentication/dto/user_login_data';

@ApiTags('manager')
@Controller('manager')
export class ManagerController {
    constructor(private readonly profileService: ProfileService) {}

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'Get manager profile' })
    @Roles(Role.MANAGER)
    @UseGuards(AuthGuard, RoleGuard)
    @Get('profiles')
    async getOneProfile(@Query('accId') accId: number): Promise<Response> {
        if (!accId) {
            throw new BadRequestException();
        }
        const profile = await this.profileService.findOneProfileByAccId(accId);

        return new Response(200, 'success', profile, null, 1);
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'List all profile' })
    @Roles(Role.MANAGER)
    @UseGuards(AuthGuard, RoleGuard)
    @Get('profiles/all')
    async getAllProfileByRole(): Promise<Response> {
        const profiles = await this.profileService.findAllProfile();

        return new Response(200, 'success', profiles, null, 1);
    }
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'List all Staff in warehouse by role' })
    @ApiOkResponse({ description: 'List all Staff in warehouse by role sucessfully' })
    @Roles(Role.MANAGER)
    @UseGuards(AuthGuard, RoleGuard)
    @Get('manager/managed-staffs')
    async getAllWarehouseStaffByRole(
        @UserLogin() userLogin: UserLoginData,
        @Query('pageNo') pageNo: number,
        @Query('roleId') roleId: number,
    ) {
        return await this.profileService.getAllWarehouseStaffByRole(Number(userLogin.accId), pageNo, Number(roleId));
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'Update staff profile by manager' })
    @Roles(Role.MANAGER)
    @UseGuards(AuthGuard, RoleGuard)
    @UsePipes(ValidationPipe)
    @Post('profiles/staff/update')
    async updateProfile(
        @Body() request: StaffProfileUpdateDto,
        @UserLogin() userLogin: UserLoginData,
    ): Promise<Response> {
        const result = await this.profileService.updateStaffProfile(request, userLogin.accId);

        if (result) {
            return new Response(201, 'success', result, null, 1);
        }

        return new Response(200, 'false', null, null, 1);
    }
}
