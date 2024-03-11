import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLE_KEY } from 'src/decorators/role.decorator';
import { Role } from 'src/enum/roles.enum';
import { AccessControllService } from 'src/shared/access_controll.service';

export class TokenDto {
    id: number;
    username: string;
    role: Role;
}

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private accessControlService: AccessControllService,
    ) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        const request = context.switchToHttp().getRequest();
        const token = request['token'] as TokenDto;
        for (const role of requiredRoles) {
            const result = this.accessControlService.isAuthorized({
                requiredRole: role,
                currentRole: token.role,
            });
            if (result) {
                return true;
            }
        }

        return false;
    }
    private isAuthorizedHard({ currentRole, requiredRoles }): Promise<boolean> {
        return requiredRoles.includes(currentRole);
    }
}
