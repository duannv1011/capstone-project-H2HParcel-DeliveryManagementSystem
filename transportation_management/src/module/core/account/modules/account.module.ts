import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthenticationModule } from '../../authentication/modules/authentication.module';
import { AccountEntity } from '../../../../enities/account.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([AccountEntity]),
        ConfigModule,
        AuthenticationModule,
        JwtModule.register({
            global: true,
            secret: '123456',
            signOptions: { expiresIn: '1d' },
        }),
    ],
    providers: [AccountService],
    controllers: [AccountController],
    exports: [TypeOrmModule],
})
export class AccountModule {}
