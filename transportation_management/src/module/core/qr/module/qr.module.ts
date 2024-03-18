import { Module } from '@nestjs/common';
import { QrController } from './qr.controller';
import { QrService } from './qr.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from 'src/entities/account.entity';
import { CustomerEntity } from 'src/entities/customer.entity';
import { StaffEntity } from 'src/entities/staff.entity';
import { AuthenticationModule } from '../../authentication/modules/authentication.module';
import { QRCodeEntity } from 'src/entities/qrcode.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([AccountEntity, StaffEntity, CustomerEntity, QRCodeEntity]),
        ConfigModule,
        AuthenticationModule,
        JwtModule.register({
            global: true,
            secret: process.env.SECRET_KEY,
            signOptions: { expiresIn: process.env.EXPIRES_IN_TOKEN },
        }),
    ],
    controllers: [QrController],
    providers: [QrService],
    exports: [TypeOrmModule],
})
export class QrModule {}
