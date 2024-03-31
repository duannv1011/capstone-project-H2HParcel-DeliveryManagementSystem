import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from '../entities/account.entity';
import { StaffEntity } from '../entities/staff.entity';
import { AccessControllService } from './service/access_controll.service';
import { ProfileService } from './service/profile.service';
import { RoleEntity } from '../entities/role.entity';
import { OrderEntity } from '../entities/order.entity';
import { OrderViewService } from './service/order-view.service';
import { AddressEntity } from '../entities/address.entity';

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([AccountEntity, StaffEntity, RoleEntity, OrderEntity, AddressEntity]),
    ],
    providers: [AccessControllService, ProfileService, OrderViewService],
    exports: [ProfileService, OrderViewService],
})
export class SharedModule {}
