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
import { AccountModule } from './module/account/modules/account.module';
import { AccountController } from './module/account/modules/account.controller';
import { AccountService } from './module/account/modules/account.service';
import { AuthenticationService } from './module/core/authentication/modules/authentication.service';
import { AuthenticationController } from './module/core/authentication/modules/authentication.controller';
import { AuthenticationModule } from './module/core/authentication/modules/authentication.module';
@Module({
    imports: [
        RoleModule,
        AccountModule,
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
        AuthenticationModule,
    ],
    controllers: [AppController, RoleController, AccountController, AuthenticationController],
    providers: [
        AppService,
        RoleService,
        AccountService,
        {
            provide: APP_FILTER,
            useClass: ExceptionsLoggerFilter,
        },
        AuthenticationService,
    ],
})
export class AppModule {
    constructor(private dataSource: DataSource) {}
}
