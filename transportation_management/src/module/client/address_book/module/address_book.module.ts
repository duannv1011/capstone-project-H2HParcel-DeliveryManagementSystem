import { Module } from '@nestjs/common';
import { AddressBookService } from './address_book.service';
import { AddressBookController } from './address_book.controller';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressEntity } from 'src/entities/address.entity';
import { CustomerEntity } from 'src/entities/customer.entity';
import { AccessControllService } from 'src/shared/access_controll.service';
import { AddressBookEntity } from 'src/entities/addressBook.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([AddressBookEntity, CustomerEntity, AddressEntity]),
        ConfigModule,
        JwtModule.register({
            global: true,
            secret: process.env.SECRET_KEY,
            signOptions: { expiresIn: process.env.EXPIRES_IN_TOKEN },
        }),
    ],
    providers: [AddressBookService, AccessControllService],
    controllers: [AddressBookController],
    exports: [TypeOrmModule],
})
export class AddressBookModule {}
