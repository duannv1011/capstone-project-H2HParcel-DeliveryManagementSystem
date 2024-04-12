import { Injectable, Logger } from '@nestjs/common';
import { vnpay } from '../../../enum/vnpay.enum';
import { ConfigService } from '@nestjs/config';
import { CreatePaymentDto } from './dto/payment-create.dto';
import * as moment from 'moment';
import * as querystring from 'qs';
import * as crypto from 'crypto';
import { Request } from 'express';

@Injectable()
export class PaymentService {
    constructor(private configService: ConfigService) {}

    public sortObject(obj) {
        const sorted = {};
        const str = [];
        let key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                str.push(encodeURIComponent(key));
            }
        }
        str.sort();
        for (key = 0; key < str.length; key++) {
            sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
        }
        return sorted;
    }

    async createPaymentUrl(paymentDto: CreatePaymentDto, req: Request): Promise<string> {
        const returnUrl = vnpay.vnp_ReturnUrl;
        const tmnCode = vnpay.vnp_TmnCode;
        const secretKey = vnpay.vnp_HashSecret;
        const vnpUrl = vnpay.vnp_Url;

        const date = new Date();
        const createDate = moment(date).format('YYYYMMDDHHmmss');

        const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const locale = paymentDto.language || 'vn';
        const currCode = 'VND';
        const orderId = moment(date).format('DDHHmmss');
        const amount = Number(paymentDto.amount);
        const bankCode = paymentDto.bankCode;

        const vnp_Params = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: tmnCode,
            vnp_Locale: locale,
            vnp_CurrCode: currCode,
            vnp_TxnRef: orderId,
            vnp_OrderInfo: 'Thanh toan cho ma GD:' + orderId,
            vnp_OrderType: 'other',
            vnp_Amount: amount * 100,
            vnp_ReturnUrl: returnUrl,
            vnp_IpAddr: ipAddr,
            vnp_CreateDate: createDate,
        };

        if (bankCode) {
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        const sortedParams = this.sortObject(vnp_Params);
        const signData = querystring.stringify(sortedParams, { encode: false });
        const hmac = crypto.createHmac('sha512', secretKey);
        sortedParams['vnp_SecureHash'] = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        const queryParams = querystring.stringify(sortedParams, { encode: false });
        Logger.log(vnpUrl + '?' + queryParams);
        return vnpUrl + '?' + queryParams;
    }

    async verifyVnPayReturn(params: Record<string, string>, secureHash: string) {
        const secretKey = vnpay.vnp_HashSecret;
        const sortedParams = this.sortObject(params);

        const signData = querystring.stringify(sortedParams, { encode: false });
        const hmac = crypto.createHmac('sha512', secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        return secureHash === signed;
    }
}
