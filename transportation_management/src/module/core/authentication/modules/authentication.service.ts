import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../dto/register_dto';
import { loginDto } from '../dto/authentication_dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CustomerService } from '../../customer/modules/customer.service';
import { StaffEntity } from '../../../../enities/staff.entity';
import { CustomerEntity } from '../../../../enities/customer.entity';
import { AddressEntity } from '../../../../enities/address.entity';
import { AccountEntity } from '../../../../enities/account.entity';

@Injectable()
export class AuthenticationService {
    constructor(
        @InjectRepository(AccountEntity)
        private readonly accountRepository: Repository<AccountEntity>,
        @InjectRepository(CustomerEntity)
        private readonly customerRepository: Repository<CustomerEntity>,
        @InjectRepository(StaffEntity)
        private readonly staffRepository: Repository<StaffEntity>,
        @InjectRepository(AddressEntity)
        private readonly addressRepository: Repository<AddressEntity>,
        private customerService: CustomerService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private dataSource: DataSource,
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    ) {}
    async register(registerData: RegisterDto): Promise<any> {
        const checkexisting = await this.accountRepository.findOne({
            where: { username: registerData.username },
        });
        if (checkexisting) {
            throw new HttpException('user already exist', HttpStatus.CONFLICT);
        }
        const hashedPassword = await this.hashpassword(registerData.password);
        registerData.password = hashedPassword;
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // create account
            const accountInsertResult = await queryRunner.manager.save(AccountEntity, {
                ...registerData,
                refresh_token: 'refresh_token_string',
                password: hashedPassword,
            });
            if (!accountInsertResult) {
                return new HttpException('account save error', HttpStatus.BAD_REQUEST);
            }
            const accountId = accountInsertResult.acc_id; // Assuming 'id' is the auto-incremented column name
            // create address
            const addressDtoData = registerData.address;
            const addressdata = await queryRunner.manager.save(AddressEntity, {
                ...addressDtoData,
            });
            if (!addressdata) {
                throw new HttpException('address save error', HttpStatus.BAD_REQUEST);
            }
            // create customer
            const customerDtodata = registerData.customer;
            customerDtodata.address_id = addressdata.address_id;
            customerDtodata.default_address = customerDtodata.default_address || addressdata.address_id;
            customerDtodata.acc_id = accountId;
            customerDtodata.status = 1;

            const customerdata = await queryRunner.manager.save(CustomerEntity, customerDtodata);

            if (!customerdata) {
                throw new HttpException('customer save error', HttpStatus.BAD_REQUEST);
            }

            await queryRunner.commitTransaction();
            return accountInsertResult;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
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
        const payload = { id: account.acc_id, username: account.username, role_id: account.role_id };
        //get
        const data_result = await this.getAdditionalData(account);
        const token = await this.genarateToken(payload);
        return { data_result: data_result, token: token };
    }
    async refreshToken(refresh_token: string): Promise<any> {
        try {
            const verify = await this.jwtService.verifyAsync(refresh_token, {
                secret: this.configService.get<string>('SECRET_KEY'),
            });
            const checkexisttoken = await this.accountRepository.findOneBy({
                username: verify.username,
                refresh_token,
            });
            if (checkexisttoken) {
                return this.genarateToken({ id: verify.id, username: verify.username, role_id: verify.role_id });
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
    private async genarateToken(payload: { id: number; username: string; role_id: number }) {
        const access_token = await this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('SECRET_KEY'),
            expiresIn: this.configService.get<string>('EXPRIRESIN_TOKEN'),
        });
        const refresh_token = await this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('SECRET_KEY'),
            expiresIn: this.configService.get<string>('EXPRIRESIN_REFRESH_TOKEN'),
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
