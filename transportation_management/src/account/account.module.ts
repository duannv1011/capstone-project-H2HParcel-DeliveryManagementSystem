import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { AccountEntity } from '../entities/account.entity/account.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([AccountEntity])],
    providers: [AccountService],
    controllers: [AccountController],
})
export class AccountModule {}
