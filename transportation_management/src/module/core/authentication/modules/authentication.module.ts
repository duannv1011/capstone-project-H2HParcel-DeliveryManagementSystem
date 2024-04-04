import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { CustomerService } from '../../../client/customer/modules/customer.service';
import { StaffEntity } from '../../../../entities/staff.entity';
import { AddressEntity } from '../../../../entities/address.entity';
import { CustomerEntity } from '../../../../entities/customer.entity';
import { AccountEntity } from '../../../../entities/account.entity';
import { RoleEntity } from '../../../../entities/role.entity';
import { InformationEntity } from 'src/entities/information.entity';
import { AddressBookEntity } from 'src/entities/address-book.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            AccountEntity,
            InformationEntity,
            CustomerEntity,
            StaffEntity,
            RoleEntity,
            AddressEntity,
            AddressBookEntity,
        ]),
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
