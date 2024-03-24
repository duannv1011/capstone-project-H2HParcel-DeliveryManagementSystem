import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationModule } from '../../core/authentication/modules/authentication.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShiftController } from './shift.controller';
import { ShiftSheetEntity } from '../../../entities/shift-sheet.entity';
import { ShiftService } from './shift.service';

@Module({
    imports: [ConfigModule, AuthenticationModule, TypeOrmModule.forFeature([ShiftSheetEntity])],
    controllers: [ShiftController],
    providers: [ShiftService],
    exports: [ShiftService],
})
export class ShiftModule {}
