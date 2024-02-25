import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AccountService } from 'src/module/account/modules/account.service';
import { RegisterDto } from '../dto/authentication_dto';
import * as bcrypt from 'bcrypt';
import { PostgresErrorCode } from 'src/database/postgresErrorCodes.enum';
@Injectable()
export class AuthenticationService {
    constructor(private readonly accountService: AccountService) {}
    public async register(registrationData: RegisterDto) {
        const hashedPassword = await bcrypt.hash(registrationData.password, 10);
        try {
            const createdUser = await this.accountService.createAccount({
                ...registrationData,
                password: hashedPassword,
            });
            createdUser.password = undefined;
            return createdUser;
        } catch (error) {
            if (error?.code === PostgresErrorCode.UniqueViolation) {
                throw new HttpException('User with that email already exists', HttpStatus.BAD_REQUEST);
            }
            throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    public async getAuthenticatedUser(username: string, hashedPassword: string) {
        try {
            const user = await this.accountService.getAccountByUsername(username);

            const isPasswordMatching = await bcrypt.compare(hashedPassword, user.password);
            if (!isPasswordMatching) {
                throw new HttpException('Wrong creden tials provided', HttpStatus.BAD_REQUEST);
            }
            user.password = undefined;
            return user;
        } catch (error) {
            throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
        }
    }
    private async verifyPassword(plainTextPassword: string, hashedPassword: string) {
        const isPasswordMatching = await bcrypt.compare(plainTextPassword, hashedPassword);
        if (!isPasswordMatching) {
            throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
        }
    }
}
