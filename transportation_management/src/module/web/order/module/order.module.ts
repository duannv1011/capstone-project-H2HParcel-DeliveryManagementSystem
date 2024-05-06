import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InformationEntity } from 'src/entities/information.entity';
import { AccountEntity } from 'src/entities/account.entity';
import { AddressEntity } from 'src/entities/address.entity';
import { CustomerEntity } from 'src/entities/customer.entity';
import { OrderEntity } from 'src/entities/order.entity';
import { QRCodeEntity } from 'src/entities/qrcode.entity';
import { RoleEntity } from 'src/entities/role.entity';
import { StaffEntity } from 'src/entities/staff.entity';
import { WarehouseEntity } from 'src/entities/warehouse.entity';
import { AddressBookEntity } from 'src/entities/address-book.entity';
import { RequestEntity } from 'src/entities/request.entity';
import { RequestRecordEntity } from 'src/entities/request-record.entity';
import { RequestStatusEntity } from 'src/entities/request-status.entity';
import { RequestTypeEntity } from 'src/entities/request-type.entity';
import { WardEntity } from 'src/entities/ward.entity';
import { PackageTypeEntity } from 'src/entities/package-type.entity';
import { PriceMultiplierEntity } from 'src/entities/price-mutiplier.entity';
import { WarehouseRuleEntity } from 'src/entities/warehouse-rule.entity';
import { ActivityLogEntity } from 'src/entities/activity-log.entity';
import { ActivityLogStatusEntity } from 'src/entities/activity-log-status.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            AccountEntity,
            AddressBookEntity,
            StaffEntity,
            WarehouseRuleEntity,
            CustomerEntity,
            AddressEntity,
            WarehouseEntity,
            WardEntity,
            PriceMultiplierEntity,
            PackageTypeEntity,
            OrderEntity,
            RoleEntity,
            QRCodeEntity,
            InformationEntity,
            RequestStatusEntity,
            RequestTypeEntity,
            ActivityLogEntity,
            ActivityLogStatusEntity,
            OrderEntity,
            RequestEntity,
            RequestRecordEntity,
            StaffEntity,
        ]),
        JwtModule.register({
            global: true,
            secret: process.env.SECRET_KEY,
            signOptions: { expiresIn: process.env.EXPIRES_IN_TOKEN },
        }),
    ],
    controllers: [OrderController],
    providers: [OrderService],
    exports: [TypeOrmModule],
})
export class OrderModule {}
