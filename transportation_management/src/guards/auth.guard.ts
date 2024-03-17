import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserLoginData } from '../module/core/authentication/dto/user_login_data';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        // const tokens = this.extractTokenFromSwagger(request);
        if (!token) {
            throw new UnauthorizedException();
        }
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('SECRET_KEY'),
            });
            request['token'] = payload;
            request['userLogin'] = payload;
        } catch {
            throw new UnauthorizedException();
        }
        return true;
    }
    private extractTokenFromSwagger(request: Request): string | undefined {
        const authHeader = request.headers['authorization'];

        if (authHeader) {
            const [type, token] = authHeader.split(' ');

            if (type === 'Bearer') {
                return token;
            }
        }

        return undefined;
    }
    private extractTokenFromHeader(req: Request): string | undefined {
        const [type, token] = req.headers.authorization ? req.headers.authorization.split(' ') : [];
        return type === 'Bearer' ? token : undefined;
    }
    async getUserFromToken(context: ExecutionContext): Promise<{ id: number; username: string; role: string }> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        // const tokens = this.extractTokenFromSwagger(request);
        if (!token) {
            throw new UnauthorizedException();
        }
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('SECRET_KEY'),
            });
            return payload;
        } catch {
            throw new UnauthorizedException();
        }
    }

    private setAccountLoggedData(payload: any): UserLoginData {
        return { accId: payload.id, username: payload.username, role: payload.role };
    }
}
