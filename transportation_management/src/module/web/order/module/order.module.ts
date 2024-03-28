import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InformationEntity } from 'src/entities/Information.entity';
import { AccountEntity } from 'src/entities/account.entity';
import { AddressEntity } from 'src/entities/address.entity';
import { CustomerEntity } from 'src/entities/customer.entity';
import { OrderEntity } from 'src/entities/order.entity';
import { QRCodeEntity } from 'src/entities/qrcode.entity';
import { RoleEntity } from 'src/entities/role.entity';
import { StaffEntity } from 'src/entities/staff.entity';
import { WarehouseEntity } from 'src/entities/warehouse.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            AccountEntity,
            StaffEntity,
            CustomerEntity,
            AddressEntity,
            WarehouseEntity,
            OrderEntity,
            RoleEntity,
            QRCodeEntity,
            InformationEntity,
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
