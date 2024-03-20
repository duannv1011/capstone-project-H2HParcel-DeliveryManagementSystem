import { Module } from '@nestjs/common';
import { StatusController } from './status.controller';
import { StatusService } from './status.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from '../../authentication/modules/authentication.module';
import { AccessControllService } from 'src/shared/service/access_controll.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([]),
        ConfigModule,
        AuthenticationModule,
        JwtModule.register({
            global: true,
            secret: process.env.SECRET_KEY,
            signOptions: { expiresIn: process.env.EXPIRES_IN_TOKEN },
        }),
    ],
    controllers: [StatusController, AccessControllService, ConfigService],
    providers: [StatusService],
    exports: [TypeOrmModule],
})
export class StatusModule {}
