import { Body, Controller, Get, Param, Put, Query, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
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
import { InjectRepository } from '@nestjs/typeorm';
import { WarehouseRuleEntity } from 'src/entities/warehouse-rule.entity';
import { Repository } from 'typeorm';
@ApiTags('account-api')
@Controller('account')
export class AccountController {
    constructor(
        private readonly accountService: AccountService,
        private configService: ConfigService,
        @InjectRepository(WarehouseRuleEntity)
        private readonly warehouseRuletRepository: Repository<WarehouseRuleEntity>,
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
    @Get('getdistance')
    async getDistance(@Query('warehouse1') warehouse1: number, @Query('warehouse2') warehouse2: number) {
        try {
            const distance = await this.warehouseRuletRepository.findOne({
                where: { warehouseId1: warehouse1, warehouseId2: warehouse2 },
            });
            return Number(distance.distance.includes(',') ? distance.distance.replace(',', '.') : distance.distance);
        } catch (error) {}
    }
}
