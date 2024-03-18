import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QRCodeEntity } from 'src/entities/qrcode.entity';
import { Repository } from 'typeorm';
import * as qrcode from 'qrcode';
import * as fs from 'fs';
@Injectable()
export class QrService {
    constructor(
        @InjectRepository(QRCodeEntity)
        private qrRepository: Repository<QRCodeEntity>,
    ) {}
    async getAllQr() {
        return await this.qrRepository.find();
    }
    async getDetailQr(code_value: string) {
        return await this.qrRepository.findOne({ where: { code_value: code_value } });
    }
    async scanQr(code_value: string) {
        return code_value;
    }
    async createQr(quantity: number) {
        //INSERT QR CODE
        const insertedCodes = await this.insertQrs2(quantity);
        console.log('insertedCodes:' + insertedCodes);
        //CREATE QR IMAGE
        // const qrImagePaths = await this.createQrImages(insertedCodes);
        // console.log('qrImagePaths' + qrImagePaths);
        // return qrImagePaths;
        return insertedCodes;
    }
    async insertQrs2(quantity: number): Promise<any> {
        const qrRecords = [];

        for (let i = 0; i < quantity; i++) {
            const newQrRecord = new QRCodeEntity();
            // Tạo giá trị cho cột code_value ở đây, có thể để null nếu bạn muốn
            newQrRecord.code_value = null;

            qrRecords.push(newQrRecord);
        }

        // Chèn mảng các bản ghi vào cơ sở dữ liệu
        const insertedRecords = await this.qrRepository.save(qrRecords);

        return insertedRecords;
    }
    async insertQrs(quantity: number): Promise<QRCodeEntity[]> {
        const qrRecords = [];
        for (let i = 0; i < quantity; i++) {
            const newQrRecord = new QRCodeEntity();
            // Tạo giá trị cho cột code_value ở đây, có thể để null nếu bạn muốn
            newQrRecord.code_value = null;
            // Chèn bản ghi mới vào mảng
            qrRecords.push(newQrRecord);
        }
        // Chèn mảng các bản ghi vào cơ sở dữ liệu
        const insertedRecords = await this.qrRepository.insert(qrRecords);

        return insertedRecords.raw.ge;
    }

    async createQrImages(insertedCodes: QRCodeEntity[]): Promise<string[]> {
        const qrImagePaths = [];
        console.log('qrImagePaths' + qrImagePaths);
        const updatePromises = insertedCodes.map(async (code) => {
            const qrCodeData = await qrcode.toDataURL(code.code_value);
            console.log('qrCodeData' + qrCodeData);
            const imageBuffer = Buffer.from(qrCodeData.split(',')[1], 'base64');
            console.log('imageBuffer' + imageBuffer);
            const imagePath = `src/uploads/qr-code/${code.code_value}.png`;
            console.log('imagePath' + imagePath);
            await fs.promises.writeFile(imagePath, imageBuffer);

            qrImagePaths.push(imagePath);
            return this.qrRepository.update({ code_value: code.code_value }, { qr_url: imagePath });
        });

        await Promise.all(updatePromises);

        return qrImagePaths;
    }
}
