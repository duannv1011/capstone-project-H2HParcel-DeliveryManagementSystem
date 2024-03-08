import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AccountEntity } from 'src/enities/account.entity';
import { StaffEntity } from 'src/enities/staff.entity';
import { CustomerEntity } from 'src/enities/customer.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AccessControllService } from 'src/shared/access_controll.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([AccountEntity, StaffEntity, CustomerEntity]),
        JwtModule.register({
            global: true,
            secret: process.env.SECRET_KEY,
            signOptions: { expiresIn: process.env.EXPIRES_IN_TOKEN },
        }),
    ],
    providers: [AdminService, AccessControllService],
    controllers: [AdminController],
    exports: [TypeOrmModule],
})
export class AdminModule {}
