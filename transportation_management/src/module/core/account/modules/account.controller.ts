import { Body, Controller, Get, Param, Put, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AccountService } from './account.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'src/module/response/Response';
import { Paging } from 'src/module/response/Paging';
import { AccountEntity } from '../../../../entities/account.entity';
import { Roles } from 'src/decorators/role.decorator';
import { Role } from 'src/enum/roles.enum';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Request } from 'express';
import { ExtractJwt } from 'passport-jwt';
import { changePasswordDto } from '../dto/changePass_dto';
import { ConfigService } from '@nestjs/config';
@ApiTags('account-api')
@Controller('account')
export class AccountController {
    constructor(
        private readonly accountService: AccountService,
        private configService: ConfigService,
    ) {}
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
    @Get('findAll:pageNo')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    @UsePipes(ValidationPipe)
    async findAllAccounts(@Param('pageNo') pageNo: string): Promise<any> {
        const pagesize = this.configService.get<string>('PAGE_SIZE');
        return this.accountService.findAllAccount(Number(pageNo), Number(pagesize));
    }
    @Get('findone:id')
    //@UseGuards(AuthenticationGuard)
    //@ApiBearerAuth('JWT-auth')
    findOneAccountbyId(@Param('id') id: string): Promise<AccountEntity> {
        return this.accountService.getAccountById(Number(id));
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
