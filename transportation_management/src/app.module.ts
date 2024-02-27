import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import { DatabaseModule } from './database/database.module';
import { APP_FILTER } from '@nestjs/core';
import { ExceptionsLoggerFilter } from './utils/exceptions-logger-filter/exceptions-logger-filter';
import { RoleService } from './module/web/role/modules/role.service';
import { RoleController } from './module/web/role/modules/role.controller';
import { RoleModule } from './module/web/role/modules/role.module';
import { DataSource } from 'typeorm';
import { AccountModule } from './module/core/account/modules/account.module';
import { AccountController } from './module/core/account/modules/account.controller';
import { AccountService } from './module/core/account/modules/account.service';
import { AuthenticationService } from './module/core/authentication/modules/authentication.service';
import { AuthenticationController } from './module/core/authentication/modules/authentication.controller';
import { AuthenticationModule } from './module/core/authentication/modules/authentication.module';
import { CustomerController } from './module/core/customer/modules/customer.controller';
import { CustomerService } from './module/core/customer/modules/customer.service';
import { CustomerModule } from './module/core/customer/modules/customer.module';
@Module({
    imports: [
        RoleModule,
        AccountModule,
        AuthenticationModule,
        ConfigModule.forRoot({
            validationSchema: Joi.object({
                POSTGRES_HOST: Joi.string().required(),
                POSTGRES_PORT: Joi.number().required(),
                POSTGRES_USER: Joi.string().required(),
                POSTGRES_PASSWORD: Joi.string().required(),
                POSTGRES_DB: Joi.string().required(),
                PORT: Joi.number(),
            }),
        }),
        DatabaseModule,
        CustomerModule,
    ],
    controllers: [AppController, RoleController, AccountController, AuthenticationController, CustomerController],
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
    ],
})
export class AppModule {
    constructor(private dataSource: DataSource) {}
}
