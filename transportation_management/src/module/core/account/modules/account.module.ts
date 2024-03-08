import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthenticationModule } from '../../authentication/modules/authentication.module';
import { AccountEntity } from '../../../../enities/account.entity';
import { CustomerEntity } from 'src/enities/customer.entity';
import { StaffEntity } from 'src/enities/staff.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([AccountEntity, StaffEntity, CustomerEntity]),
        ConfigModule,
        AuthenticationModule,
        JwtModule.register({
            global: true,
            secret: process.env.SECRET_KEY,
            signOptions: { expiresIn: process.env.EXPIRES_IN_TOKEN },
        }),
    ],
    providers: [AccountService],
    controllers: [AccountController],
    exports: [TypeOrmModule],
})
export class AccountModule {}
