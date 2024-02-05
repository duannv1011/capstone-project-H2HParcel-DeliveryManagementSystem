import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountEntity } from 'src/entities/account.entity/account.entity';

@Controller('account')
export class AccountController {
    constructor(private readonly accountService: AccountService) {}
    @Get('')
    getAllAccounts() {
        return this.accountService.getAllAccount();
    }
    @Get(':id')
    getAccountbyId(@Param('id') id: string) {
        return this.accountService.getAccountById(Number(id));
    }
    @Post(':id')
    async createAccount(@Param('id') id: string, @Body() data: AccountEntity) {
        return this.accountService.UpdateAccount(Number(id), data);
    }
}
