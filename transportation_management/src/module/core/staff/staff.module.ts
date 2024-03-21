import { Module } from '@nestjs/common';
import { StaffController } from './staff.controller';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from '../../../shared/shared.module';
import { AuthenticationModule } from '../authentication/modules/authentication.module';
import { StaffService } from './staff.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from '../../../entities/order.entity';
import { QRCodeEntity } from '../../../entities/qrcode.entity';

@Module({
    imports: [ConfigModule, AuthenticationModule, SharedModule, TypeOrmModule.forFeature([QRCodeEntity, OrderEntity])],
    controllers: [StaffController],
    providers: [StaffService],
    exports: [StaffService],
})
export class StaffModule {}
