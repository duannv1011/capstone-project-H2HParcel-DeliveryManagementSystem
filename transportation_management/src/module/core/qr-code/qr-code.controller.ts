import {
    Body,
    Controller,
    Get,
    Header,
    ParseIntPipe,
    Post,
    Query,
    StreamableFile,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Response } from '../../response/Response';
import { QrCodeService } from './qr-code.service';
import { QrCodeCreateDto } from './dto/qr-code.create.dto';
import { QrCodeListDto } from './dto/qr-code.list.dto';
import * as moment from 'moment-timezone';
import { DATE_FORMAT, TIMEZONE } from '../../../shared/contants';
import { AssignCodeDto } from './dto/assign-code.dto';
import { AuthGuard } from '../../../guards/auth.guard';
import { UserLogin } from 'src/decorators/user_login.decorator';
import { UserLoginData } from '../authentication/dto/user_login_data';
import { ScanQrDto } from './dto/scan-qr-code.dto';
import { Roles } from 'src/decorators/role.decorator';
import { Role } from 'src/enum/roles.enum';
import { RoleGuard } from 'src/guards/role.guard';

@ApiTags('qr-code')
@Controller('qr-code')
export class QrCodeController {
    constructor(private readonly qrCodeService: QrCodeService) {}

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'Create QR code list' })
    @ApiOperation({ summary: 'Create QR code list' })
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
    @ApiOperation({ summary: 'View all QR code list' })
    @Get('all')
    async findAllQrCode(@Query('pageNo', ParseIntPipe) pageNo: number): Promise<Response> {
        const qrCode = await this.qrCodeService.findAllQrCode(pageNo);

        return new Response(200, 'true', qrCode.qrCodes, qrCode.paging, 1);
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'View QR code detail' })
    @ApiOperation({ summary: 'View QR code detail' })
    @UseGuards(AuthGuard)
    @ApiUnauthorizedResponse()
    @Get('detail')
    async findOneOrder(@Query('codeValue') codeValue: string): Promise<Response> {
        const qrCode = await this.qrCodeService.findOneQrCode(codeValue);

        return new Response(200, 'true', qrCode, null, 1);
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'Download QR code to file zip' })
    @ApiOperation({ summary: 'Download QR code to file zip' })
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

    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'Assign qr code to order' })
    @ApiOperation({ summary: 'Assign qr code to order' })
    @UseGuards(AuthGuard)
    @UsePipes(ValidationPipe)
    @ApiUnauthorizedResponse()
    @ApiBody({ type: AssignCodeDto })
    @Post('assign')
    async assignCodeToOrder(@Body() request: AssignCodeDto): Promise<Response> {
        const result = await this.qrCodeService.assignCodeToOrder(request);

        return new Response(201, 'success', result, null, 1);
    }
    @ApiBearerAuth('JWT-auth')
    @ApiOkResponse({ description: 'Scan QR successfully' })
    @ApiOperation({ summary: 'Scan QR to update Status Order' })
    @Roles(Role.SHIPPER, Role.STAFF, Role.MANAGER)
    @UseGuards(AuthGuard, RoleGuard)
    @UsePipes(ValidationPipe)
    @ApiUnauthorizedResponse()
    @Post('qr/staff/scan-qr')
    async scanQr(@Body() request: ScanQrDto, @UserLogin() user: UserLoginData): Promise<Response> {
        const result = await this.qrCodeService.scanQR(request, Number(user.accId));

        return new Response(201, 'success', result, null, 1);
    }
}
