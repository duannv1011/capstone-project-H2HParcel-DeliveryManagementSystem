import { Controller, Get, ParseIntPipe, Query, Redirect, Req } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Request } from 'express';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('order')
@ApiTags('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}

    @Get('create_payment_url')
    @Redirect()
    @ApiQuery({ name: 'bankCode', required: false, type: Number })
    async createPaymentUrl(
        @Req() req: Request,
        @Query('amount', ParseIntPipe) amount: number,
        @Query('bankCode') bankCode: string,
        @Query('language') language: string,
    ) {
        return { url: await this.paymentService.createPaymentUrl(amount, bankCode, language, req) };
    }

    @Get('vnpay_return')
    @ApiResponse({ status: 200, description: 'Success' })
    async vnpayReturn(@Query() params: Record<string, string>) {
        const secureHash = params['vnp_SecureHash'];

        delete params['vnp_SecureHash'];
        delete params['vnp_SecureHashType'];

        const isValid = this.paymentService.verifyVnPayReturn(params, secureHash);

        if (isValid) {
            // Check if the data in the database is valid and respond accordingly
            return { code: params['vnp_ResponseCode'], data: params };
        } else {
            return { code: 409 };
        }
    }
}
