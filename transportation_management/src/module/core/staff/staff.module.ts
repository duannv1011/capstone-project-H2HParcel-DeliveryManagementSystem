import { Module } from '@nestjs/common';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { AuthenticationModule } from '../authentication/modules/authentication.module';
import { ConfigModule } from '@nestjs/config';
import { ProfileService } from '../../../shared/profile.service';
import { AccessControllService } from '../../../shared/access_controll.service';

@Module({
    imports: [ConfigModule, AuthenticationModule],
    controllers: [StaffController],
    providers: [StaffService, ProfileService, AccessControllService],
    exports: [StaffService],
})
export class StaffModule {}
