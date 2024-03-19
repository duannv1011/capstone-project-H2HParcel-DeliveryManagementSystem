import { Module } from '@nestjs/common';
import { StaffController } from './staff.controller';
import { ConfigModule } from '@nestjs/config';
import { AccessControllService } from '../../../shared/service/access_controll.service';
import { SharedModule } from '../../../shared/shared.module';
import { AuthenticationModule } from '../authentication/modules/authentication.module';

@Module({
    imports: [ConfigModule, AuthenticationModule, SharedModule],
    controllers: [StaffController],
    providers: [AccessControllService],
})
export class StaffModule {}
