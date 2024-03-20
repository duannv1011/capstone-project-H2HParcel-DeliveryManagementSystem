import { Module } from '@nestjs/common';
import { StaffController } from './staff.controller';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from '../../../shared/shared.module';
import { AuthenticationModule } from '../authentication/modules/authentication.module';
import { StaffService } from './staff.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CodeEntity } from '../../../entities/code.entity';
import { OrderEntity } from '../../../entities/order.entity';

@Module({
    imports: [ConfigModule, AuthenticationModule, SharedModule, TypeOrmModule.forFeature([CodeEntity, OrderEntity])],
    controllers: [StaffController],
    providers: [StaffService],
    exports: [StaffService],
})
export class StaffModule {}
