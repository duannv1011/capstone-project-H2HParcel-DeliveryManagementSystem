import { Module } from '@nestjs/common';
import { WarehourseService } from './warehourse.service';
import { WarehourseController } from './warehourse.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressEntity } from 'src/entities/address.entity';
import { WarehouseEntity } from 'src/entities/warehouse.entity';
import { ConfigService } from '@nestjs/config';
import { AccessControllService } from 'src/shared/service/access_controll.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([AddressEntity, WarehouseEntity]),
        JwtModule.register({
            global: true,
            secret: process.env.SECRET_KEY,
            signOptions: { expiresIn: process.env.EXPIRES_IN_TOKEN },
        }),
    ],
    providers: [WarehourseService, AccessControllService, ConfigService],
    controllers: [WarehourseController],
    exports: [TypeOrmModule],
})
export class WarehourseModule {}
