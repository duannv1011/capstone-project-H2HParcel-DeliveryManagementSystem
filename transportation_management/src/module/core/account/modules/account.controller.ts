import { Body, Controller, Get, Param, Post, Put, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AccountService } from './account.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AutheicationGuard } from '../../authentication/modules/authentication.guard';
import { Response } from 'src/module/response/Response';
import { Paging } from 'src/module/response/Paging';
import { CreateAccountdto } from '../dto/creaete_account_dto';
import { ChangePasswordAccountdto } from '../dto/changepass_account_dto';
import { UpdateResult } from 'typeorm';
import { AccountEntity } from '../entity/entity/account';
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
    @UseGuards(AutheicationGuard)
    @Get('findAll')
    @ApiBearerAuth('JWT-auth')
    async findAllAccounts(): Promise<AccountEntity[]> {
        return this.accountService.findAllAccount();
    }
    @Get('findone:id')
    @UseGuards(AutheicationGuard)
    @ApiBearerAuth('JWT-auth')
    findOneAccountbyId(@Param('id') id: string): Promise<AccountEntity> {
        return this.accountService.getAccountById(Number(id));
    }
    @Post('create')
    @UsePipes(ValidationPipe)
    @UseGuards(AutheicationGuard)
    createAccount(@Body() createAccountdto: CreateAccountdto): Promise<AccountEntity> {
        return this.accountService.createAccount(createAccountdto);
    }
    @Put('changepassword:id')
    @UsePipes(ValidationPipe)
    // @UseGuards(AutheicationGuard)
    async UpdatePasswordAccount(
        @Param('id') id: string,
        @Body() data: ChangePasswordAccountdto,
    ): Promise<UpdateResult> {
        return this.accountService.UpdatePasswordAccount(Number(id), data);
    }
}
