import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, UpdateResult } from 'typeorm';
import { AccountEntity } from '../../../../enities/account.entity';
import { CreateAccountdto } from '../dto/creaete_account_dto';
import * as bcrypt from 'bcrypt';
import { ChangePasswordAccountdto } from '../dto/changepass_account_dto';

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
    async UpdatePasswordAccount(id: number, data: ChangePasswordAccountdto): Promise<UpdateResult> {
        const account = await this.accountRepository.findOneBy({ acc_id: id });
        const isOldPasswordValid = await bcrypt.compare(data.oldpassword, account.password);
        if (!isOldPasswordValid) {
            throw new HttpException('Old password is incorrect', HttpStatus.CONFLICT);
        }
        const hashpasswords = await bcrypt.hash(data.password, 10);
        account.password = hashpasswords.toString();
        return await this.accountRepository.update(id, account);
    }
}
