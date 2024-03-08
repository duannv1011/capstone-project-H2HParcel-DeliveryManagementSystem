import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { CustomerEntity } from '../../../../enities/customer.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([CustomerEntity]),
        ConfigModule,
        JwtModule.register({
            global: true,
            secret: process.env.SECRET_KEY,
            signOptions: { expiresIn: process.env.EXPIRES_IN_TOKEN },
        }),
    ],
    providers: [CustomerService],
    controllers: [CustomerController],
    exports: [TypeOrmModule],
})
export class CustomerModule {}
