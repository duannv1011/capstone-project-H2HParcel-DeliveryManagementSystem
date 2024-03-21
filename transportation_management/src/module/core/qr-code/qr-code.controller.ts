import {
    Body,
    Controller,
    Get,
    Header,
    Post,
    Query,
    StreamableFile,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Response } from '../../response/Response';
import { QrCodeService } from './qr-code.service';
import { QrCodeCreateDto } from './dto/qr-code.create.dto';
import { QrCodeListDto } from './dto/qr-code.list.dto';
import { AuthGuard } from '../../../guards/auth.guard';
import * as moment from 'moment-timezone';
import { DATE_FORMAT, TIMEZONE } from '../../../shared/contants';

@ApiTags('qr-code')
@Controller('qr-code')
export class QrCodeController {
    constructor(private readonly qrCodeService: QrCodeService) {}

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'Create QR code list' })
    @UseGuards(AuthGuard)
    @UsePipes(ValidationPipe)
    @ApiUnauthorizedResponse()
    @ApiBody({ type: QrCodeCreateDto })
    @Post('create')
    async createQrCode(@Body() request: QrCodeCreateDto): Promise<Response> {
        const result = await this.qrCodeService.createQrCode(request);

        return new Response(201, 'success', result, null, 1);
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'View all QR code list' })
    @UseGuards(AuthGuard)
    @ApiUnauthorizedResponse()
    @Get('all')
    async findAllQrCode(): Promise<Response> {
        const qrCodeList = await this.qrCodeService.findAllQrCode();

        return new Response(200, 'true', qrCodeList, null, 1);
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'View QR code detail' })
    @UseGuards(AuthGuard)
    @ApiUnauthorizedResponse()
    @Get('detail')
    async findOneOrder(@Query('codeValue') codeValue: string): Promise<Response> {
        const qrCode = await this.qrCodeService.findOneQrCode(codeValue);

        if (qrCode) {
            return new Response(200, 'true', qrCode, null, 1);
        }

        return new Response(200, 'false', null, null, 1);
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'Download QR code to file zip' })
    @UseGuards(AuthGuard)
    @UsePipes(ValidationPipe)
    @ApiUnauthorizedResponse()
    @ApiBody({ type: QrCodeListDto })
    @Header('Content-Type', 'application/zip')
    @Header('Content-Disposition', `attachment; filename="qrcode_${moment().tz(TIMEZONE).format(DATE_FORMAT)}.zip"`)
    @Post('print')
    async zipQrCodeList(@Body() request: QrCodeListDto): Promise<StreamableFile> {
        const buffer: Buffer = await this.qrCodeService.zipQrCodeList(request);

        return new StreamableFile(buffer);
    }
}
