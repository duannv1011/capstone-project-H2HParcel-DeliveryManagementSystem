import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationModule } from '../../core/authentication/modules/authentication.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { WarehouseEntity } from '../../../entities/warehouse.entity';
import { OrderEntity } from '../../../entities/order.entity';
import { StaffEntity } from '../../../entities/staff.entity';
import { DistrictEntity } from '../../../entities/district.entity';
import { WardEntity } from '../../../entities/ward.entity';

@Module({
    imports: [
        ConfigModule,
        AuthenticationModule,
        TypeOrmModule.forFeature([WardEntity, DistrictEntity, WarehouseEntity, OrderEntity, StaffEntity]),
    ],
    controllers: [ReportController],
    providers: [ReportService],
    exports: [ReportService],
})
export class ReportModule {}
