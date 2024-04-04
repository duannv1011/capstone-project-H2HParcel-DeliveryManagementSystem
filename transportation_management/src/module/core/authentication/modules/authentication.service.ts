import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../dto/register-dto';
import { loginDto } from '../dto/authentication-dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CustomerService } from '../../../client/customer/modules/customer.service';
import { StaffEntity } from '../../../../entities/staff.entity';
import { CustomerEntity } from '../../../../entities/customer.entity';
import { AddressEntity } from '../../../../entities/address.entity';
import { AccountEntity } from '../../../../entities/account.entity';
import { InformationEntity } from 'src/entities/information.entity';
import { AddressBookEntity } from 'src/entities/address-book.entity';

@Injectable()
export class AuthenticationService {
    constructor(
        @InjectRepository(AccountEntity)
        private readonly accountRepository: Repository<AccountEntity>,
        @InjectRepository(CustomerEntity)
        private readonly customerRepository: Repository<CustomerEntity>,
        @InjectRepository(StaffEntity)
        private readonly staffRepository: Repository<StaffEntity>,
        @InjectRepository(InformationEntity)
        private readonly informationRepository: Repository<InformationEntity>,
        @InjectRepository(AddressEntity)
        private readonly addressRepository: Repository<AddressEntity>,
        private customerService: CustomerService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private dataSource: DataSource,
    ) {}

    async register(registerData: RegisterDto): Promise<any> {
        const checkexistingUsername = await this.accountRepository
            .createQueryBuilder('account')
            .where('account.username = :username', { username: registerData.username })
            .getOne();

        const checkscus = await this.customerRepository
            .createQueryBuilder('customer')
            .where('customer.email = :email', { email: registerData.customer.email })
            .leftJoinAndSelect('customer.account', 'account') // only select the AccountEntity, not the related ones
            .getOne();

        const checkstaff = await this.staffRepository
            .createQueryBuilder('staff')
            .where('staff.email = :email', { email: registerData.customer.email })
            .leftJoinAndSelect('staff.account', 'account') // only select the AccountEntity, not the related ones
            .getOne();

        if (checkexistingUsername) {
            return 'user is already exsit';
        }
        if (checkscus || checkstaff) {
            return 'email is already exsit';
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
                refreshToken: 'refreshToken_string',
                password: hashedPassword,
            });
            const accountId = accountInsertResult.accId; // Assuming 'id' is the auto-incremented column name
            // create address
            const addressDtoData = registerData.address;
            const addressdata = await queryRunner.manager.save(AddressEntity, {
                ...addressDtoData,
            });
            console.log('address' + addressdata);
            //create information
            const information = new InformationEntity();
            information.name = registerData.customer.fullName;
            information.phone = registerData.customer.phone;
            information.address = addressdata;
            const informationResult = await queryRunner.manager.save(InformationEntity, information);
            // create customer
            const customerDtodata = registerData.customer;
            console.log(customerDtodata);
            customerDtodata.addressId = addressdata.addressId;
            customerDtodata.accId = accountId;
            customerDtodata.status = 1;
            const customerdata = await queryRunner.manager.save(CustomerEntity, customerDtodata);
            //create AdressBook
            const addressBook = new AddressBookEntity();
            addressBook.customer = customerdata;
            addressBook.isDeleted = false;
            addressBook.infor = informationResult;
            const addressbookdata = await queryRunner.manager.save(AddressBookEntity, addressBook);
            await queryRunner.commitTransaction();
            //update defaultBook of Customer
            customerdata.defaultBook = addressbookdata.bookId;
            await queryRunner.manager.save(CustomerEntity, customerdata);
            return 'login success';
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
        const payload = { id: account.accId, username: account.username, role: account.role.roleName };
        //get
        //const dataTesult = await this.getAdditionalData(account);
        const token = await this.genarateToken(payload);
        return [{ token: token }, { payload: payload }];
    }

    async refreshToken(refreshToken: string): Promise<any> {
        try {
            const verify = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.configService.get<string>('SECRET_KEY'),
            });
            const checkexisttoken = await this.accountRepository.findOneBy({
                username: verify.username,
                refreshToken,
            });
            if (checkexisttoken) {
                return this.genarateToken({ id: verify.id, username: verify.username, role: verify.role });
            } else {
                throw new HttpException('refresh token not found', HttpStatus.BAD_REQUEST);
            }
        } catch (error) {
            throw new HttpException(error, HttpStatus.BAD_REQUEST);
        }
    }

    public async hashpassword(password: string): Promise<string> {
        const saltTime = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, saltTime);
    }

    private async checkPassword(input: string, password: string) {
        return bcrypt.compare(input, password);
    }

    private async genarateToken(payload: { id: number; username: string; role: string }) {
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('SECRET_KEY'),
            expiresIn: this.configService.get<string>('EXPRIRESIN_TOKEN'),
        });

        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('SECRET_KEY'),
            expiresIn: this.configService.get<string>('EXPRIRESIN_REFRESH_TOKEN'),
        });
        await this.accountRepository.update({ username: payload.username }, { refreshToken: refreshToken });
        return { accessToken, refreshToken };
    }

    private async getAdditionalData(account: AccountEntity): Promise<any> {
        switch (account.role.roleName) {
            case 'CUSTOMER':
                const customer = await this.customerRepository.findOne({
                    where: { accId: account.accId },
                });
                if (!customer) {
                    return { message: 'user isvalid', status: 404 };
                }
                return customer;
            case 'STAFF':
            case 'SHIPPER':
            case 'MANAGER':
            case 'ADMIN':
                const staff = await this.staffRepository.findOne({
                    where: { accId: account.accId },
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
