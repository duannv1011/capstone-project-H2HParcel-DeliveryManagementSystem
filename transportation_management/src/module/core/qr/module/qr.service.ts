import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QRCodeEntity } from 'src/entities/qrcode.entity';
import { DataSource, Repository } from 'typeorm';
import * as qrcode from 'qrcode';
import * as fs from 'fs';
@Injectable()
export class QrService {
    constructor(
        @InjectRepository(QRCodeEntity)
        private qrRepository: Repository<QRCodeEntity>,
        private dataSource: DataSource,
    ) {}
    async getAllQr() {
        const colorPalette = {
            dark: '#000000',
            light: '#ffffff',
        };
        const a = await qrcode.toDataURL('cmc.png', 'I am Cuamotcang!', colorPalette);
        console.log(a);
        //return await this.qrRepository.find();
    }
    async getDetailQr(code_value: string) {
        return await this.qrRepository.findOne({ where: { code_value: code_value } });
    }
    async scanQr(code_value: string) {
        return code_value;
    }
    async createQr(quantity: number) {
        //INSERT QR CODE
        const insertedCodes = await this.insertQrs(quantity);
        //CREATE QR IMAGE
        await this.createQrImages(insertedCodes);
        return insertedCodes;
    }
    async insertQrs(quantity: number): Promise<any> {
        const insertedata = [];
        for (let i = 0; i < quantity; i++) {
            const qrCode = new QRCodeEntity();
            insertedata.push(qrCode);
        }
        const inserted = await this.qrRepository.insert(insertedata);
        return inserted.generatedMaps;
    }

    async createQrImages(codes: QRCodeEntity[]): Promise<any> {
        const qrImagePaths = [];
        const updatePromises = codes.map(async (code) => {
            code.code_value = `h2horderqrcode${code.code_id.toString()}`;
            const qrCodeData = await qrcode.toDataURL(code.code_value);
            const imagePath = `src/uploads/qr-code/${code.code_value}.png`;
            qrImagePaths.push(imagePath);
});

        await Promise.all(updatePromises);
        return qrImagePaths;
    }
}
