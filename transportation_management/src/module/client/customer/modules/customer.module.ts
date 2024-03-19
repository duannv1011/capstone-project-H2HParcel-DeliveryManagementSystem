import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { CustomerEntity } from '../../../../entities/customer.entity';
import { AccessControllService } from 'src/shared/access_controll.service';
import { AddressEntity } from 'src/entities/address.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([CustomerEntity, AddressEntity]),
        ConfigModule,
        JwtModule.register({
            global: true,
            secret: process.env.SECRET_KEY,
            signOptions: { expiresIn: process.env.EXPIRES_IN_TOKEN },
        }),
    ],
    providers: [CustomerService, AccessControllService, ConfigService],
    controllers: [CustomerController],
    exports: [TypeOrmModule],
})
export class CustomerModule {}
