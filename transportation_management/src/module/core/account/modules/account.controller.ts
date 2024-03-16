import { Body, Controller, Get, Param, Post, Put, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AccountService } from './account.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from '../../authentication/modules/authentication.guard';
import { Response } from 'src/module/response/Response';
import { Paging } from 'src/module/response/Paging';
import { CreateAccountdto } from '../dto/creaete_account_dto';
import { AccountEntity } from '../../../../entities/account.entity';
import { Roles } from 'src/decorators/role.decorator';
import { Role } from 'src/enum/roles.enum';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Request } from 'express';
import { ExtractJwt } from 'passport-jwt';
import { changePasswordDto } from '../dto/changePass_dto';
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
    @UseGuards(AuthenticationGuard)
    @Get('findAll')
    @ApiBearerAuth('JWT-auth')
    async findAllAccounts(): Promise<AccountEntity[]> {
        return this.accountService.findAllAccount();
    }
    @Get('findone:id')
    //@UseGuards(AuthenticationGuard)
    //@ApiBearerAuth('JWT-auth')
    findOneAccountbyId(@Param('id') id: string): Promise<AccountEntity> {
        return this.accountService.getAccountById(Number(id));
    }
    @Post('create')
    @UsePipes(ValidationPipe)
    @UseGuards(AuthenticationGuard)
    createAccount(@Body() createAccountdto: CreateAccountdto): Promise<AccountEntity> {
        return this.accountService.createAccount(createAccountdto);
    }
    @Put('updatePaasword')
    @Roles(Role.CUSTOMER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @UsePipes(ValidationPipe)
    async updateCustomerPass(@Body() pass: changePasswordDto, @Req() request: Request) {
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
        return this.accountService.updateCustomerPass(pass.password, token);
    }
}
