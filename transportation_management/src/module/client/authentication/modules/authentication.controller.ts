import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { RegisterDto } from '../dto/authentication_dto';
import { LocalAuthenticationGuard } from './localAuthentication.guard';
import RequestWithUser from './requestWithUser.interface';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('authentication-api')
@Controller('authentication')
export class AuthenticationController {
    constructor(private readonly authenticationService: AuthenticationService) {}
    @Post('register')
    async register(@Body() registrationData: RegisterDto) {
        return this.authenticationService.register(registrationData);
    }
    @HttpCode(200)
    @UseGuards(LocalAuthenticationGuard)
    @Post('log-in')
    async logIn(@Req() request: RequestWithUser) {
        const account = request.account;
        account.password = undefined;
        return account;
    }
}
