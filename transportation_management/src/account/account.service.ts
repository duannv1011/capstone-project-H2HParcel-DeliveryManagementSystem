import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountEntity } from 'src/entities/account.entity/account.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateAccountDto } from './dto/create-account-dto/create-account-dto';

@Injectable()
export class AccountService {
    constructor(
        @InjectRepository(AccountEntity)
        private readonly accountRepository: Repository<AccountEntity>,
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
    async getAccountById(id: number) {
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
    async createAccount(data: CreateAccountDto) {
        try {
            const newAccount = new AccountEntity();
            newAccount.username = data.username;
            newAccount.password = data.password;
            newAccount.role_id = data.role_id;
            newAccount.isActive = data.isActive;
            await this.accountRepository.save(newAccount);
            return newAccount;
        } catch (error) {
            throw new HttpException('Account not created! somthing error', HttpStatus.NOT_FOUND);
        }
    }
    async UpdateAccount(id: number, data: AccountEntity) {
        await this.accountRepository.update(id, data);
        const accountupdate = await this.accountRepository.findOne({
            where: { acc_id: id },
        });
        return accountupdate ? accountupdate : 'update failed or not find account updated';
    }
}
