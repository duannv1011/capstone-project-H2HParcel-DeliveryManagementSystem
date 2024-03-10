import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserLogin = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.userLogin;
});
