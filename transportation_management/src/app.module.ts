import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountModule } from './account/account.module';
import { RoleModule } from './role/role.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import { DatabaseModule } from './database/database.module';
import { CustomerModule } from './customer/customer.module';
import { WhitehourseService } from './whitehourse/whitehourse.service';
import { WhitehourseModule } from './whitehourse/whitehourse.module';
import { OrderController } from './order/order.controller';
import { OrderService } from './order/order.service';
import { OrderModule } from './order/order.module';
import { WarehourseModule } from './warehourse/warehourse.module';
import { WarehorseService } from './warehorse/warehorse.service';
@Module({
    imports: [
        AccountModule,
        RoleModule,
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
        WhitehourseModule,
        OrderModule,
        WarehourseModule,
    ],
    controllers: [AppController, OrderController],
    providers: [AppService, WhitehourseService, OrderService, WarehorseService],
})
export class AppModule {}
