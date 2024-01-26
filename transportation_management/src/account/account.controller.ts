import { Body, Controller, Get, Post } from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account-dto/create-account-dto';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  async getAllAccounts() {
    return this.accountService.getAllAccounts();
  }

  @Post('create')
  async createRolePost(@Body() data: CreateAccountDto) {
    return await this.accountService.createRolePost(data);
  }
}
