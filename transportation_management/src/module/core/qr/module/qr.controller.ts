import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QrService } from './qr.service';
import { QRCreateDto } from '../dto/qR_create_dto';
// import { UserLogin } from 'src/decorators/user_login.decorator';
// import { UserLoginData } from '../../authentication/modules/user_login_data';
@Controller('qr')
@ApiTags('QR-crud-api')
export class QrController {
    constructor(private readonly qrService: QrService) {}
    @Get('getAll')
    async getAllQr() {
        return this.qrService.getAllQr();
    }

    @Get('getAll:code_value')
    async getDetailQr(@Param('code_value') code_value: string) {
        return this.qrService.getDetailQr(code_value);
    }
    @Patch('scan_QR:code_value')
    async scanQr(@Param('code_value') code_value: string) {
        return this.qrService.scanQr(code_value);
    }
    @Post('createQR')
    async createQr(@Body() request: QRCreateDto) {
        return this.qrService.createQr(request.quantity);
    }
}
