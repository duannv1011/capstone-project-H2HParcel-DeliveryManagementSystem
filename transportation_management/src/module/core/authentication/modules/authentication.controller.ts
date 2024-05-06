import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { ApiTags } from '@nestjs/swagger';
import { RegisterDto } from '../dto/register-dto';
import { loginDto } from '../dto/authentication-dto';
import { refreshTokenDto } from '../dto/refresh-token-dto';

@ApiTags('authentication-api')
@Controller('authentication')
export class AuthenticationController {
    constructor(private readonly authenticationService: AuthenticationService) {}
    @Post('register')
    @UsePipes(ValidationPipe)
    register(@Body() registrationData: RegisterDto): Promise<any> {
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
