import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AutheicationGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        // get  token input when excute
        //const token = this.extractTokenFromeHeader(request);
        // get swanger token herer
        const swaggerToken = this.extractTokenFromSwagger(request);
        console.log(swaggerToken);
        if (!swaggerToken) {
            throw new UnauthorizedException();
        }
        try {
            const payload = await this.jwtService.verifyAsync(swaggerToken, {
                secret: this.configService.get<string>('SECRET'),
            });
            request['userdata'] = payload;
        } catch (error) {
            throw new UnauthorizedException();
        }
        return true;
    }
    private extractTokenFromeHeader(req: Request): string | undefined {
        const [type, token] = req.headers.authorization ? req.headers.authorization.split(' ') : [];
        return type === 'Bearer' ? token : undefined;
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
}
