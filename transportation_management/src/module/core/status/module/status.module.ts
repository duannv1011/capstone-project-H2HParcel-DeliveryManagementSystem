import { Module } from '@nestjs/common';
import { StatusController } from './status.controller';
import { StatusService } from './status.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from '../../authentication/modules/authentication.module';
import { OrderStatusEntity } from 'src/entities/order-status.entity';
import { RequestStatusEntity } from 'src/entities/request-status.entity';
import { RequestTypeEntity } from 'src/entities/request-type.entity';
import { PackageTypeEntity } from 'src/entities/package-type.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([OrderStatusEntity, RequestStatusEntity, PackageTypeEntity, RequestTypeEntity]),
        ConfigModule,
        AuthenticationModule,
        JwtModule.register({
            global: true,
            secret: process.env.SECRET_KEY,
            signOptions: { expiresIn: process.env.EXPIRES_IN_TOKEN },
        }),
    ],
    controllers: [StatusController],
    providers: [StatusService],
    exports: [TypeOrmModule],
})
export class StatusModule {}
