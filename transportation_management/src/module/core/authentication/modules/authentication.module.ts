import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { CustomerService } from '../../customer/modules/customer.service';
import { StaffEntity } from '../../../../enities/staff.entity';
import { AddressEntity } from '../../../../enities/address.entity';
import { CustomerEntity } from '../../../../enities/customer.entity';
import { AccountEntity } from '../../../../enities/account.entity';
import { RoleEntity } from '../../../../enities/role.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([AccountEntity, CustomerEntity, StaffEntity, RoleEntity, AddressEntity]),
        ConfigModule,
        JwtModule.register({
            global: true,
            secret: process.env.SECRET_KEY,
            signOptions: { expiresIn: process.env.EXPIRES_IN_TOKEN },
        }),
    ],
    providers: [AuthenticationService, CustomerService],
    controllers: [AuthenticationController],
    exports: [TypeOrmModule],
})
export class AuthenticationModule {}
