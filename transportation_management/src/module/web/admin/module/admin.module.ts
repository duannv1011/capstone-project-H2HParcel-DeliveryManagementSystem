import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AccountEntity } from 'src/entities/account.entity';
import { StaffEntity } from 'src/entities/staff.entity';
import { CustomerEntity } from 'src/entities/customer.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AddressEntity } from 'src/entities/address.entity';
import { WarehouseEntity } from 'src/entities/warehouse.entity';
import { StatusService } from 'src/module/core/status/service/status.service';
import { CustomerService } from 'src/module/client/customer/modules/customer.service';
import { StaffService } from 'src/module/core/staff/staff.service';
import { CodeEntity } from 'src/entities/code.entity';
import { OrderEntity } from 'src/entities/order.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            AccountEntity,
            StaffEntity,
            CustomerEntity,
            AddressEntity,
            CodeEntity,
            WarehouseEntity,
            OrderEntity,
        ]),
        JwtModule.register({
            global: true,
            secret: process.env.SECRET_KEY,
            signOptions: { expiresIn: process.env.EXPIRES_IN_TOKEN },
        }),
    ],
    providers: [AdminService, StatusService, CustomerService, StaffService],
    controllers: [AdminController],
    exports: [TypeOrmModule],
})
export class AdminModule {}
