import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from 'src/entities/account.entity';
import { SendMailService } from './send_mail.service';
import { AccountService } from 'src/module/core/account/modules/account.service';
import { SendMailController } from './send_mail.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { mailerConfig } from '../../mail_config/mailer.config';
import { CustomerEntity } from 'src/entities/customer.entity';
import { StaffEntity } from 'src/entities/staff.entity';
import { AccessControllService } from 'src/shared/access_controll.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([AccountEntity, CustomerEntity, StaffEntity]),
        ConfigModule,
        MailerModule.forRoot(mailerConfig),
    ],
    providers: [SendMailService, AccountService, AccessControllService],
    controllers: [SendMailController],
    exports: [TypeOrmModule],
})
export class SendMailModule {}
