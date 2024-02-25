import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AccountEntity } from 'src/entities/account.entity/account.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authenticationService: AuthenticationService) {
        super({
            username: 'username',
        });
    }
    async validate(email: string, password: string): Promise<AccountEntity> {
        return this.authenticationService.getAuthenticatedUser(email, password);
    }
}
