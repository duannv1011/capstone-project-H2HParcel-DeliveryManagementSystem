import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { ApiTags } from '@nestjs/swagger';
import { RegisterDto } from '../dto/register_dto';
import { loginDto } from '../dto/authentication_dto';
import { refreshTokenDto } from '../dto/refresh_token_dto';

@ApiTags('authentication-api')
@Controller('authentication')
export class AuthenticationController {
    constructor(private readonly authenticationService: AuthenticationService) {}
    @Post('register')
    @UsePipes(ValidationPipe)
    register(@Body() registrationData: RegisterDto) {
        return this.authenticationService.register(registrationData);
    }
    @Post('login')
    @UsePipes(ValidationPipe)
    login(@Body() loginData: loginDto): Promise<any> {
        return this.authenticationService.login(loginData);
    }
    @Post('refresh_token')
    refreshToken(@Body() refreshToken: refreshTokenDto): Promise<string> {
        return this.authenticationService.refreshToken(refreshToken.refresh_token);
    }
}
