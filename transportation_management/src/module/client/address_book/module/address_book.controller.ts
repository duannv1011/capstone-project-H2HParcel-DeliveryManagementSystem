import { Body, Controller, Get, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AddressBookService } from './address_book.service';
import { createAddresBookDto } from '../dto/create_address_book_dto';
import { setDefaultAddressDto } from '../dto/set_default_address_dto';
import { Role } from 'src/enum/roles.enum';
import { Roles } from 'src/decorators/role.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { UserLogin } from 'src/decorators/user_login.decorator';
import { UserLoginData } from 'src/module/core/authentication/modules/user_login_data';
import { UpdateAddresBookDto } from '../dto/update_address_book_dto';

@Controller('address-book')
@ApiTags('address-book-api')
export class AddressBookController {
    constructor(private readonly addressBookService: AddressBookService) {}
    @Get('getAddressBookByCusId')
    @Roles(Role.CUSTOMER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    async getAddressBookByCusId(@UserLogin() userLogin: UserLoginData): Promise<any> {
        return this.addressBookService.getAddressBookByCusId(Number(userLogin.accId));
    }
    @Get('getAddressBookById')
    @Roles(Role.CUSTOMER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    async getAddressBookById(@UserLogin() userLogin: UserLoginData, @Query('book_id') book_id: number): Promise<any> {
        return this.addressBookService.getAddressBookById(Number(userLogin.accId), book_id);
    }
    @Get('getDefaultBookByCusId')
    @Roles(Role.CUSTOMER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    async getDefaultBookByCusId(@UserLogin() userLogin: UserLoginData): Promise<any> {
        return this.addressBookService.getDefaultBookByCusId(Number(userLogin.accId));
    }
    @Post('CreateDefaultAddress')
    @Roles(Role.CUSTOMER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    async createAddressBook(@UserLogin() userLogin: UserLoginData, @Body() data: createAddresBookDto): Promise<any> {
        return this.addressBookService.createAddressBook(data, userLogin.accId);
    }
    @Put('setDefaultAddress')
    @Roles(Role.CUSTOMER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    async setDefaultAddressBook(
        @Body() data: setDefaultAddressDto,
        @UserLogin() userLogin: UserLoginData,
    ): Promise<any> {
        return this.addressBookService.setDefaultAddressBook(Number(data.book_id), userLogin.accId);
    }
    @Put('updateAddressBook')
    @Roles(Role.CUSTOMER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    async updateAddressbook(@Body() data: UpdateAddresBookDto, @UserLogin() userLogin: UserLoginData): Promise<any> {
        return this.addressBookService.updateAddressbook(data, userLogin.accId);
    }
    @Put('softDeleteAddressBook')
    @Roles(Role.CUSTOMER)
    @UseGuards(AuthGuard, RoleGuard)
    @ApiBearerAuth('JWT-auth')
    async softDeleteAddressBook(
        @Body() data: setDefaultAddressDto,
        @UserLogin() userLogin: UserLoginData,
    ): Promise<any> {
        return this.addressBookService.softDelete(Number(data.book_id), userLogin.accId);
    }
}
