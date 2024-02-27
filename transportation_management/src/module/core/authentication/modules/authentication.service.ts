import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AccountEntity } from '../entity/account';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../dto/register_dto';
import { loginDto } from '../dto/authentication_dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CustomerService } from '../../customer/modules/customer.service';
import { StaffEntity } from '../entity/staff';
import { CustomerEntity } from '../entity/customer';

@Injectable()
export class AuthenticationService {
    constructor(
        @InjectRepository(AccountEntity)
        private readonly accountRepository: Repository<AccountEntity>,
        @InjectRepository(CustomerEntity)
        private readonly customerRepository: Repository<CustomerEntity>,
        @InjectRepository(StaffEntity)
        private readonly staffRepository: Repository<StaffEntity>,
        private customerService: CustomerService,
        private dataSource: DataSource,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}
    async register(registerData: RegisterDto): Promise<AccountEntity> {
        const checkexisting = await this.accountRepository.findOne({
            where: { username: registerData.username },
        });
        if (checkexisting) {
            throw new HttpException('user already exist', HttpStatus.CONFLICT);
        }
        const hashedPassword = await this.hashpassword(registerData.password);
        registerData.password = hashedPassword;
        return await this.accountRepository.save({
            ...registerData,
            refresh_token: 'refresh_token_string',
            password: hashedPassword,
        });
    }
    async login(logindata: loginDto): Promise<any> {
        const account = await this.accountRepository.findOne({
            where: { username: logindata.username },
        });
        if (!account) {
            throw new HttpException('wrong user or passsword ', HttpStatus.UNAUTHORIZED);
        }
        const checkPassword = await this.checkPassword(logindata.password, account.password);
        if (!checkPassword) {
            throw new HttpException('wrong user or passsword1 ', HttpStatus.UNAUTHORIZED);
        }
        // genarate token and refresh token
        const payload = { id: account.acc_id, username: account.username };
        //get
        const data_result = await this.getAdditionalData(account);
        const token = await this.genarateToken(payload);
        return { data_result: data_result, token: token };
    }
    async refreshToken(refresh_token: string): Promise<any> {
        try {
            const verify = await this.jwtService.verifyAsync(refresh_token, {
                secret: this.configService.get<string>('SECRET'),
            });
            const checkexisttoken = await this.accountRepository.findOneBy({
                username: verify.username,
                refresh_token,
            });
            if (checkexisttoken) {
                return this.genarateToken({ id: verify.id, username: verify.username });
            } else {
                throw new HttpException('refresh token not found', HttpStatus.BAD_REQUEST);
            }
        } catch (error) {
            throw new HttpException(error, HttpStatus.BAD_REQUEST);
        }
    }
    private async hashpassword(password: string): Promise<string> {
        const saltTime = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, saltTime);
    }
    private async checkPassword(input: string, password: string) {
        return bcrypt.compare(input, password);
    }
    private async genarateToken(payload: { id: number; username: string }) {
        const access_token = await this.jwtService.signAsync(payload);
        const refresh_token = await this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('SECRET'),
            expiresIn: this.configService.get<string>('EXPRIRESIN_TOKEN'),
        });
        await this.accountRepository.update({ username: payload.username }, { refresh_token: refresh_token });
        return { access_token, refresh_token };
    }
    private async getAdditionalData(account: AccountEntity): Promise<any> {
        switch (account.role.role_name) {
            case 'customer':
                const customer = await this.customerRepository.findOne({
                    where: { acc_id: account.acc_id },
                });
                if (!customer) {
                    return { message: 'user isvalid', status: 404 };
                }
                return customer;
            case 'staff':
            case 'shipper':
            case 'manager':
            case 'admin':
                const staff = await this.staffRepository.findOne({
                    where: { acc_id: account.acc_id },
                });
                if (!staff) {
                    return { message: 'user isvalid', status: 404 };
                }
                return staff;

            // Add other roles if needed

            default:
                return { message: 'user isvalid', status: 404 };
        }
    }
}
