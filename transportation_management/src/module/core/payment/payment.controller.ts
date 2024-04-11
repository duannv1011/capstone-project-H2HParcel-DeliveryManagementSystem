import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/payment-create.dto';
import { Request } from 'express';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('order')
@ApiTags('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}
    @Post('/create_payment_url')
    async createPaymentUrl(@Body() data: CreatePaymentDto, req: Request) {
        return await this.paymentService.createPaymentUrl(data, req);
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
            return { code: params['vnp_ResponseCode'] };
        } else {
            return { code: 409 };
        }
    }
}
