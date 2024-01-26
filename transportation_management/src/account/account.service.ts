import { Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account-dto/create-account-dto';

@Injectable()
export class AccountService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createRolePost(data: CreateAccountDto) {}
  async getAllAccounts() {
    return 'All accounts';
  }
}
