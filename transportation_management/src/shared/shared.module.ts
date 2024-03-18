import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from '../entities/account.entity';
import { StaffEntity } from '../entities/staff.entity';
import { RequestEntity } from '../entities/request.entity';
import { AccessControllService } from './service/access_controll.service';
import { ProfileService } from './service/profile.service';
import { RequestService } from './service/request.service';
import { RoleEntity } from '../entities/role.entity';

@Module({
    imports: [ConfigModule, TypeOrmModule.forFeature([AccountEntity, StaffEntity, RoleEntity, RequestEntity])],
    providers: [AccessControllService, ProfileService, RequestService],
    exports: [ProfileService, RequestService],
})
export class SharedModule {}
