import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_FILTER } from '@nestjs/core';
import { ExceptionsLoggerFilter } from './utils/exceptions-logger-filter/exceptions-logger-filter';
import { RoleService } from './module/web/role/modules/role.service';
import { RoleController } from './module/web/role/modules/role.controller';
import { RoleModule } from './module/web/role/modules/role.module';
import { AccountModule } from './module/core/account/modules/account.module';
import { AccountController } from './module/core/account/modules/account.controller';
import { AccountService } from './module/core/account/modules/account.service';
import { AuthenticationService } from './module/core/authentication/modules/authentication.service';
import { AuthenticationController } from './module/core/authentication/modules/authentication.controller';
import { AuthenticationModule } from './module/core/authentication/modules/authentication.module';
import { CustomerController } from './module/core/customer/modules/customer.controller';
import { CustomerService } from './module/core/customer/modules/customer.service';
import { CustomerModule } from './module/core/customer/modules/customer.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StaffModule } from './module/client/staff/staff.module';
import { StaffService } from './module/client/staff/staff.service';
import { StaffController } from './module/client/staff/staff.controller';

@Module({
    imports: [
        DatabaseModule,
        RoleModule,
        AccountModule,
        AuthenticationModule,
        CustomerModule,
        ConfigModule.forRoot({ envFilePath: '.env' }),
        StaffModule,
    ],
    controllers: [
        AppController,
        RoleController,
        AccountController,
        AuthenticationController,
        CustomerController,
        StaffController,
    ],
    providers: [
        AppService,
        RoleService,
        AccountService,
        AuthenticationService,
        {
            provide: APP_FILTER,
            useClass: ExceptionsLoggerFilter,
        },
        CustomerService,
        ConfigService,
        StaffService,
    ],
})
export class AppModule {}
