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
import { CustomerController } from './module/client/customer/modules/customer.controller';
import { CustomerService } from './module/client/customer/modules/customer.service';
import { CustomerModule } from './module/client/customer/modules/customer.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { mailerConfig } from './module/core/send_mail/mail_config/mailer.config';
import { MailerModule } from '@nestjs-modules/mailer';
import { SendMailController } from './module/core/send_mail/modules/send_mail/send_mail.controller';
import { SendMailService } from './module/core/send_mail/modules/send_mail/send_mail.service';
import { SendMailModule } from './module/core/send_mail/modules/send_mail/send_mail.module';
import { SharedModule } from './shared/shared.module';
import { AccessControllService } from './shared/access_controll.service';
import { AdminModule } from './module/web/admin/module/admin.module';
import { WarehourseModule } from './module/web/warehourse/modules/warehourse.module';
import { WarehourseController } from './module/web/warehourse/modules/warehourse.controller';
import { WarehourseService } from './module/web/warehourse/modules/warehourse.service';
import { AddressBookModule } from './module/client/address_book/module/address_book.module';
import { AddressBookService } from './module/client/address_book/module/address_book.service';
import { AddressBookController } from './module/client/address_book/module/address_book.controller';
import { ProfileService } from './shared/profile.service';
import { StaffModule } from './module/core/staff/staff.module';
import { ManagerModule } from './module/core/manager/manager.module';
import { StaffController } from './module/core/staff/staff.controller';

@Module({
    imports: [
        DatabaseModule,
        RoleModule,
        AccountModule,
        AuthenticationModule,
        CustomerModule,
        SendMailModule,
        MailerModule.forRoot(mailerConfig),
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
        SharedModule,
        AdminModule,
        WarehourseModule,
        AddressBookModule,
        StaffModule,
        ManagerModule,
    ],
    controllers: [
        AppController,
        RoleController,
        AccountController,
        AuthenticationController,
        CustomerController,
        SendMailController,
        WarehourseController,
        AddressBookController,
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
        SendMailService,
        AccessControllService,
        WarehourseService,
        AddressBookService,
        ProfileService,
    ],
})
export class AppModule {}
