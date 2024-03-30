import { Paging } from '../../../response/Paging';

export interface QrCodeResponse {
    qrCodes: QrCode[];
    paging: Paging;
}

export interface QrCodeDetailResponse {
    qrCode: QrCode;
}

export interface QrCode {
    codeId: number;
    codeValue: string;
    qrUrl: string;
    price: string;
    dateCreateAt: Date;
    orderId: number;
}

export interface QrCodeCreate {
    successQuantity: number;
}
