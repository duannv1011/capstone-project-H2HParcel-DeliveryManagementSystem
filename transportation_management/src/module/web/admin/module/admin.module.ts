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
import { CustomerService } from 'src/module/client/customer/modules/customer.service';
import { StaffService } from 'src/module/core/staff/staff.service';
import { OrderEntity } from 'src/entities/order.entity';
import { WarehourseService } from '../../warehourse/modules/warehourse.service';
import { AuthenticationService } from 'src/module/core/authentication/modules/authentication.service';
import { RoleEntity } from 'src/entities/role.entity';
import { QrCodeService } from 'src/module/core/qr-code/qr-code.service';
import { QRCodeEntity } from 'src/entities/qrcode.entity';
import { InformationEntity } from 'src/entities/information.entity';
import { OrderStatusEntity } from 'src/entities/order-status.entity';
import { PackageTypeEntity } from 'src/entities/package-type.entity';
import { PriceMultiplierEntity } from 'src/entities/price-mutiplier.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            AccountEntity,
            StaffEntity,
            CustomerEntity,
            AddressEntity,
            WarehouseEntity,
            OrderEntity,
            PriceMultiplierEntity,
            PackageTypeEntity,
            RoleEntity,
            QRCodeEntity,
            InformationEntity,
            OrderStatusEntity,
        ]),
        JwtModule.register({
            global: true,
            secret: process.env.SECRET_KEY,
            signOptions: { expiresIn: process.env.EXPIRES_IN_TOKEN },
        }),
    ],
    providers: [AdminService, QrCodeService, CustomerService, StaffService, AuthenticationService, WarehourseService],
    controllers: [AdminController],
    exports: [TypeOrmModule],
})
export class AdminModule {}
