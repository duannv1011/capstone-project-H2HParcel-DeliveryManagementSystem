import { Module } from '@nestjs/common';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { AuthenticationModule } from "../../core/authentication/modules/authentication.module";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

@Module({
    imports: [
        ConfigModule,
        AuthenticationModule,
        JwtModule.register({
            global: true,
            secret: '123456',
            signOptions: { expiresIn: '1d' },
        }),
    ],
    controllers: [StaffController],
    providers: [StaffService],
})
export class StaffModule {}
