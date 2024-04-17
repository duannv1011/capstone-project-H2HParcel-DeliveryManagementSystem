import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationModule } from '../../core/authentication/modules/authentication.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { WarehouseEntity } from '../../../entities/warehouse.entity';
import { StaffEntity } from '../../../entities/staff.entity';
import { DistrictEntity } from '../../../entities/district.entity';
import { OrderEntity } from 'src/entities/order.entity';

@Module({
    imports: [
        ConfigModule,
        AuthenticationModule,
        TypeOrmModule.forFeature([DistrictEntity, WarehouseEntity, StaffEntity, OrderEntity]),
    ],
    controllers: [ReportController],
    providers: [ReportService],
    exports: [ReportService],
})
export class ReportModule {}
