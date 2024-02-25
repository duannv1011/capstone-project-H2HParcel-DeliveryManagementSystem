import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { PassportModule } from '@nestjs/passport';
import { AccountService } from 'src/module/account/modules/account.service';
import { AccountEntity } from 'src/entities/account.entity/account.entity';

@Module({
    imports: [TypeOrmModule.forFeature([AccountEntity]), PassportModule],
    providers: [AuthenticationService, AccountService],
    controllers: [AuthenticationController],
})
export class AuthenticationModule {}
