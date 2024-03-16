import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationModule } from '../authentication/modules/authentication.module';
import { ProfileService } from '../../../shared/profile.service';
import { ManagerController } from './manager.controller';
import { ManagerService } from './manager.service';
import { AccessControllService } from "../../../shared/access_controll.service";

@Module({
    imports: [ConfigModule, AuthenticationModule],
    controllers: [ManagerController],
    providers: [ManagerService, ProfileService, AccessControllService],
    exports: [ManagerService],
})
export class ManagerModule {}
