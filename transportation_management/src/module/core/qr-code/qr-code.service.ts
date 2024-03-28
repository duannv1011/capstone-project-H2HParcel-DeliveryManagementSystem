import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QrCodeCreateDto } from './dto/qr-code.create.dto';
import * as moment from 'moment-timezone';
import * as QrCode from 'qrcode';
import * as JSZip from 'jszip';
import { DATE_FORMAT, TIMEZONE } from '../../../shared/contants';
import { QRCodeEntity } from '../../../entities/qrcode.entity';
import { QrCodeListDto } from './dto/qr-code.list.dto';

@Injectable()
export class QrCodeService {
    constructor(
        @InjectRepository(QRCodeEntity)
        private codeRepository: Repository<QRCodeEntity>,
    ) {}

    /**
     * create qr code list.
     *
     * @param request QrCodeCreateDto
     */
    async createQrCode(request: QrCodeCreateDto): Promise<boolean> {
        try {
            const codeEnitties: QRCodeEntity[] = [];

            for (let item = 0; item < request.quantity; item++) {
                const qrKey: string = `qrcode${item}_${moment().tz(TIMEZONE).format(DATE_FORMAT)}_${moment().valueOf()}`;

                const entity: QRCodeEntity = new QRCodeEntity();
                entity.code_value = qrKey;
                entity.qr_url = `qr-code/${moment().tz(TIMEZONE).format(DATE_FORMAT)}/${qrKey}.png`;
                codeEnitties.push(entity);
            }
            await this.codeRepository.save(codeEnitties);

            return true;
        } catch (error) {
            Logger.log(error);
            throw new InternalServerErrorException();
        }
    }

    /**
     * Find all qrcode.
     */
    async findAllQrCode(): Promise<QRCodeEntity[]> {
        try {
            return await this.codeRepository.find();
        } catch (error) {
            Logger.log(error);
            throw new InternalServerErrorException();
        }
    }

    /**
     * Find one qr code detail.
     *
     * @param codeValue string
     */
    async findOneQrCode(codeValue: string): Promise<QRCodeEntity> {
        try {
            return await this.codeRepository.findOne({
                where: { code_value: codeValue },
                order: { code_id: { direction: 'ASC' } },
            });
        } catch (error) {
            Logger.log(error);
            throw new InternalServerErrorException();
        }
    }

    /**
     * Zip Qrcode selected.
     *
     * @param request QrCodeListDto
     */
    async zipQrCodeList(request: QrCodeListDto): Promise<Buffer> {
        try {
            const zip: JSZip = new JSZip();

            // for (const code of request.codeValues) {
            //     const qrCode = await this.codeRepository.findOne({ where: { code_value: code } });

            //     if (qrCode) {
            //         const imageName = `${qrCode.code_value}.png`;
            //         let orderId: number = null;
            //         if (qrCode.order) {
            //             orderId = qrCode.order.order_id;
            //         }
            //         const qrContent = `{ codeValue: ${qrCode.code_value}, orderId: ${orderId} }`;
            //         const qrFile = await QrCode.toBuffer(`${qrContent}`);
            //         zip.file(imageName, qrFile);
            //     }
            // }

            return await zip.generateAsync({ type: 'nodebuffer' });
        } catch (error) {
            Logger.log(error);
            throw new InternalServerErrorException();
        }
    }
}
