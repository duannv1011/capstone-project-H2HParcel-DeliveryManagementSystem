import { Module } from '@nestjs/common';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { CityEntity } from 'src/entities/city.entity';
import { DistrictEntity } from 'src/entities/district.entity';
import { WardEntity } from 'src/entities/ward.entity';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forFeature([CityEntity, DistrictEntity, WardEntity]),
        JwtModule.register({
            global: true,
            secret: process.env.SECRET_KEY,
            signOptions: { expiresIn: process.env.EXPIRES_IN_TOKEN },
        }),
    ],
    controllers: [AddressController],
    providers: [AddressService],
    exports: [TypeOrmModule],
})
export class AddressModule {}
