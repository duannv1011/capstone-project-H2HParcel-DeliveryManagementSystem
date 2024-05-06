import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationModule } from '../authentication/modules/authentication.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestController } from './request.controller';
import { RequestService } from './request.service';
import { RequestEntity } from '../../../entities/request.entity';
import { RequestTypeEntity } from '../../../entities/request-type.entity';
import { RequestStatusEntity } from '../../../entities/request-status.entity';
import { RequestRecordEntity } from '../../../entities/request-record.entity';
import { StaffEntity } from '../../../entities/staff.entity';
import { OrderEntity } from 'src/entities/order.entity';
import { TransitEntity } from 'src/entities/transit.entity';
import { WarehouseRuleEntity } from 'src/entities/warehouse-rule.entity';

@Module({
    imports: [
        ConfigModule,
        AuthenticationModule,
        TypeOrmModule.forFeature([
            RequestRecordEntity,
            RequestEntity,
            OrderEntity,
            WarehouseRuleEntity,
            TransitEntity,
            RequestTypeEntity,
            RequestStatusEntity,
            StaffEntity,
        ]),
    ],
    controllers: [RequestController],
    providers: [RequestService],
    exports: [RequestService],
})
export class RequestModule {}
