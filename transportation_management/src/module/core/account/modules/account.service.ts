import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AccountEntity } from '../../../../entities/account.entity';
import { CreateAccountdto } from '../dto/creaete_account_dto';
import * as bcrypt from 'bcrypt';
import { StaffEntity } from 'src/entities/staff.entity';
import { CustomerEntity } from 'src/entities/customer.entity';
import { decode } from 'jsonwebtoken';
import { JwtPayload } from 'src/shared/jwtToken._itf';
import { Response } from 'src/module/response/Response';

@Injectable()
export class AccountService {
    constructor(
        @InjectRepository(AccountEntity)
        private readonly accountRepository: Repository<AccountEntity>,
        @InjectRepository(StaffEntity)
        private readonly staffRespository: Repository<StaffEntity>,
        @InjectRepository(CustomerEntity)
        private readonly customerRespository: Repository<CustomerEntity>,
        private dataSource: DataSource,
    ) {}
    async getAllAccount() {
        const [accounts, count] = await this.accountRepository.findAndCount({
            order: {
                acc_id: 'ASC',
            },
        });
        if (accounts && accounts.length > 0) {
            return [accounts, count];
        } else {
            return 'List of accounts is empty';
        }
        // return accounts ? accounts.sort() : 'List of accounts is empty';
    }
    async findAllAccount(): Promise<AccountEntity[]> {
        return await this.accountRepository.find({
            select: ['acc_id', 'username', 'role_id', 'date_create_at', 'date_update_at'],
            order: {
                acc_id: 'ASC',
            },
        });
    }
    async getAccountById(id: number): Promise<AccountEntity> {
        try {
            const account = await this.accountRepository.findOne({
                where: {
                    acc_id: id,
                },
            });
            return account;
        } catch (error) {
            throw new HttpException('account not found', HttpStatus.BAD_REQUEST);
        }
    }
    async getAccountByUsername(username: string) {
        try {
            const account = await this.accountRepository.findOne({
                where: {
                    username: username,
                },
            });
            return account;
        } catch (error) {
            throw new HttpException('account not found', HttpStatus.BAD_REQUEST);
        }
    }
    async createAccount(data: CreateAccountdto): Promise<AccountEntity> {
        try {
            const checkexistingAccount = await this.accountRepository.findOneBy({
                username: data.username,
            });
            if (checkexistingAccount) {
                throw new HttpException('Account already exists', HttpStatus.CONFLICT);
            }
            const hashpasswords = await bcrypt.hash(data.password, 10);
            data.password = hashpasswords.toString();
            return await this.accountRepository.save(data);
        } catch (error) {
            throw new HttpException(error, HttpStatus.CONFLICT);
        }
    }

    async updateCustomerPass(password: string, token: string): Promise<any> {
        const JwtPayload = decode(token) as JwtPayload;
        const account = await this.accountRepository.findOne({ where: { acc_id: JwtPayload.id } });
        if (!account) {
            return new Response(404, 'notfound', null);
        }
        const newpass = await this.hashpassword(password);
        const update = await this.accountRepository
            .createQueryBuilder()
            .update(AccountEntity)
            .set({ password: newpass })
            .where('acc_id = :acc_id', { acc_id: JwtPayload.id })
            .execute()
            .catch((error) => {
                console.error('Error save password:', error);
                throw error;
            });
        return new Response(200, 'success', update);
    }
    private async hashpassword(password: string): Promise<string> {
        const saltTime = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, saltTime);
    }
}
