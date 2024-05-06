import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
import { AdminModule } from './module/web/admin/module/admin.module';
import { WarehourseModule } from './module/web/warehourse/modules/warehourse.module';
import { WarehourseController } from './module/web/warehourse/modules/warehourse.controller';
import { WarehourseService } from './module/web/warehourse/modules/warehourse.service';
import { AddressBookModule } from './module/client/address_book/module/address_book.module';
import { AddressBookService } from './module/client/address_book/module/address_book.service';
import { AddressBookController } from './module/client/address_book/module/address_book.controller';
import { StaffModule } from './module/core/staff/staff.module';
import { StaffController } from './module/core/staff/staff.controller';
import { ProfileService } from './shared/service/profile.service';
import { StatusModule } from './module/core/status/module/status.module';
import { QrCodeModule } from './module/core/qr-code/qr-code.module';
import { QrCodeController } from './module/core/qr-code/qr-code.controller';
import { AdminController } from './module/web/admin/module/admin.controller';
import { AdminService } from './module/web/admin/module/admin.service';
import { StatusService } from './module/core/status/module/status.service';
import { AddressModule } from './module/core/address/address.module';
import { OrderModule } from './module/web/order/module/order.module';
import { ManagercrudModule } from './module/web/managercrud/module/managercrud.module';
import { RequestModule } from './module/core/request/request.module';
import { ReportModule } from './module/web/report/report.module';
import { ShipperModule } from './module/client/shipper/shipper.module';
import { PaymentController } from './module/core/payment/payment.controller';
import { PaymentModule } from './module/core/payment/payment.module';
import { PaymentService } from './module/core/payment/payment.service';
@Module({
    imports: [
        DatabaseModule,
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
        StatusModule,
        QrCodeModule,
        AdminModule,
        StaffModule,
        AddressModule,
        OrderModule,
        ManagercrudModule,
        RequestModule,
        ShipperModule,
        ReportModule,
        PaymentModule,
    ],
    controllers: [
        AppController,
        AccountController,
        AuthenticationController,
        CustomerController,
        SendMailController,
        WarehourseController,
        AddressBookController,
        StaffController,
        QrCodeController,
        AdminController,
        StaffController,
        PaymentController,
    ],
    providers: [
        AppService,
        AccountService,
        AuthenticationService,
        CustomerService,
        ConfigService,
        SendMailService,
        WarehourseService,
        AddressBookService,
        ProfileService,
        AdminService,
        StatusService,
        PaymentService,
    ],
})
export class AppModule {}
