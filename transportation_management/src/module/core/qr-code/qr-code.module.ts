import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationModule } from '../authentication/modules/authentication.module';
import { AccessControllService } from '../../../shared/service/access_controll.service';
import { QrCodeService } from './qr-code.service';
import { QrCodeController } from './qr-code.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QRCodeEntity } from '../../../entities/qrcode.entity';
import { StaffEntity } from 'src/entities/staff.entity';
import { OrderEntity } from 'src/entities/order.entity';
import { ActivityLogEntity } from 'src/entities/activity-log.entity';
import { ActivityLogStatusEntity } from 'src/entities/activity-log-status.entity';
import { OrderStatusEntity } from 'src/entities/order-status.entity';

@Module({
    imports: [
        ConfigModule,
        AuthenticationModule,
        TypeOrmModule.forFeature([
            QRCodeEntity,
            OrderStatusEntity,
            ActivityLogEntity,
            ActivityLogStatusEntity,
            OrderEntity,
            StaffEntity,
        ]),
    ],
    controllers: [QrCodeController],
    providers: [AccessControllService, QrCodeService],
    exports: [QrCodeService],
})
export class QrCodeModule {}
