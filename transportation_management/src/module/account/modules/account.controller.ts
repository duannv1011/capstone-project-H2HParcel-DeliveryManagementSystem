import { Body, Controller, Get, Param, Post, Put, UseFilters } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountEntity } from 'src/entities/account.entity/account.entity';
import { ApiTags } from '@nestjs/swagger';
import { CreateAccountDto } from '../dto/create-account-dto';
import { ExceptionsLoggerFilter } from 'src/utils/exceptions-logger-filter/exceptions-logger-filter';
import { Response } from 'src/module/response/Response';
import { Paging } from 'src/module/response/Paging';
@ApiTags('account-api')
@Controller('account')
export class AccountController {
    constructor(private readonly accountService: AccountService) {}
    @Get('getAll')
    async getAllAccounts() {
        try {
            const data = await this.accountService.getAllAccount();
            const currentPage = 1;
            const pageSize = 5;
            const totalCount = parseInt(data[1].toString());
            const pagingRes = new Paging(currentPage, pageSize, totalCount);
            const response = new Response(200, 'success', data[0], pagingRes, 1);
            return response;
        } catch (error) {}
    }
    @Get('getOne:id')
    getAccountbyId(@Param('id') id: string) {
        return this.accountService.getAccountById(Number(id));
    }
    @Put('update:id')
    async UpdateAccount(@Param('id') id: string, @Body() data: AccountEntity) {
        return this.accountService.UpdateAccount(Number(id), data);
    }
    @Post('create')
    @UseFilters(ExceptionsLoggerFilter)
    async createAccount(@Body() data: CreateAccountDto) {
        try {
            return this.accountService.createAccount(data);
        } catch (error) {}
    }
}
