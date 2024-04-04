import { Module } from '@nestjs/common';
import { ShipperService } from './shipper.service';
import { ShipperController } from './shipper.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InformationEntity } from 'src/entities/Information.entity';
import { AccountEntity } from 'src/entities/account.entity';
import { AddressBookEntity } from 'src/entities/address-book.entity';
import { AddressEntity } from 'src/entities/address.entity';
import { CustomerEntity } from 'src/entities/customer.entity';
import { OrderEntity } from 'src/entities/order.entity';
import { PackageTypeEntity } from 'src/entities/package-type.entity';
import { PriceMultiplierEntity } from 'src/entities/price-mutiplỉe.entity';
import { QRCodeEntity } from 'src/entities/qrcode.entity';
import { RequestRecordEntity } from 'src/entities/request-record.entity';
import { RequestStatusEntity } from 'src/entities/request-status.entity';
import { RequestTypeEntity } from 'src/entities/request-type.entity';
import { RequestEntity } from 'src/entities/request.entity';
import { RoleEntity } from 'src/entities/role.entity';
import { StaffEntity } from 'src/entities/staff.entity';
import { WardEntity } from 'src/entities/ward.entity';
import { WarehouseRuleEntity } from 'src/entities/warehouse-rule.entity';
import { WarehouseEntity } from 'src/entities/warehouse.entity';

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
            OrderEntity,
            RequestEntity,
            RequestRecordEntity,
        ]),
        JwtModule.register({
            global: true,
            secret: process.env.SECRET_KEY,
            signOptions: { expiresIn: process.env.EXPIRES_IN_TOKEN },
        }),
    ],
    controllers: [ShipperController],
    providers: [ShipperService],
    exports: [TypeOrmModule],
})
export class ShipperModule {}
