import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountEntity } from 'src/entities/account.entity/account.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AccountService {
    constructor(
        @InjectRepository(AccountEntity)
        private accountRepository: Repository<AccountEntity>,
    ) {}
    async getAllAccount() {
        const accounts = await this.accountRepository.findAndCount();
        return accounts ? accounts : 'List of roles is empty';
    }
    async getAccountById(id: number) {
        const account = await this.accountRepository.findOne({
            where: {
                acc_id: id,
            },
        });
        return account ? account : 'account not found';
    }
    async UpdateAccount(id: number, data: AccountEntity) {
        await this.accountRepository.update(id, data);
        const accountupdate = await this.accountRepository.findOne({
            where: { acc_id: id },
        });
        return accountupdate
            ? accountupdate
            : 'update failed or not find account updated';
    }
}
