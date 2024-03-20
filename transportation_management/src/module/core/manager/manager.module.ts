import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationModule } from '../authentication/modules/authentication.module';
import { ManagerController } from './manager.controller';
import { AccessControllService } from '../../../shared/service/access_controll.service';
import { SharedModule } from '../../../shared/shared.module';

@Module({
    imports: [ConfigModule, AuthenticationModule, SharedModule],
    controllers: [ManagerController],
    providers: [AccessControllService],
})
export class ManagerModule {}
