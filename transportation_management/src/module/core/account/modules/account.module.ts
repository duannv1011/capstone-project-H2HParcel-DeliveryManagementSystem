import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthenticationModule } from '../../authentication/modules/authentication.module';
import { AccountEntity } from '../../../../entities/account.entity';
import { CustomerEntity } from 'src/entities/customer.entity';
import { StaffEntity } from 'src/entities/staff.entity';
import { QRCodeEntity } from 'src/entities/qrcode.entity';
import { WarehouseRuleEntity } from 'src/entities/warehouse-rule.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([AccountEntity, WarehouseRuleEntity, StaffEntity, CustomerEntity, QRCodeEntity]),
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
