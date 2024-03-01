import { Module } from '@nestjs/common';
import { AccountEntity } from '../entity/account';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { CustomerService } from '../../customer/modules/customer.service';
import { StaffEntity } from '../entity/staff';
import { RoleEntity } from '../entity/role';
import { AddressEntity } from '../entity/address';
import { CustomerEntity } from '../entity/customer';

@Module({
    imports: [
        TypeOrmModule.forFeature([AccountEntity, CustomerEntity, StaffEntity, RoleEntity, AddressEntity]),
        ConfigModule,
        JwtModule.register({
            global: true,
            secret: 'SECRET',
            signOptions: { expiresIn: '1d' },
        }),
    ],
    providers: [AuthenticationService, CustomerService],
    controllers: [AuthenticationController],
    exports: [TypeOrmModule],
})
export class AuthenticationModule {}
