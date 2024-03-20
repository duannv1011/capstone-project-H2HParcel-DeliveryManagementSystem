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
import { OrderViewService } from './service/order-view.service';
import { OrderEntity } from '../entities/order.entity';

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([AccountEntity, StaffEntity, RoleEntity, RequestEntity, OrderEntity]),
    ],
    providers: [AccessControllService, ProfileService, RequestService, OrderViewService],
    exports: [ProfileService, RequestService, OrderViewService],
})
export class SharedModule {}
