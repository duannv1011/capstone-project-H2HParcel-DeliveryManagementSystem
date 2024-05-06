import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLE_KEY } from 'src/decorators/role.decorator';
import { Role } from 'src/enum/roles.enum';

export class TokenDto {
    id: number;
    username: string;
    role: Role;
}

interface IsAuthorizedParams {
    currentRole: Role;
    requiredRoles: Role[];
}

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        const request = context.switchToHttp().getRequest();
        const token = request['token'] as TokenDto;
        // for (const role of requiredRoles) {
        // const result = this.accessControlService.isAuthorized({
        //     requiredRole: role,
        //     currentRole: token.role,
        // });
        //     if (result) {
        //         return true;
        //     }
        // }
        const checkRole = this.isAuthorizedHard({
            requiredRoles: requiredRoles,
            currentRole: token.role,
        });

        return checkRole;
    }

    private isAuthorizedHard({ currentRole, requiredRoles }: IsAuthorizedParams): boolean {
        return requiredRoles.includes(currentRole);
    }
}
