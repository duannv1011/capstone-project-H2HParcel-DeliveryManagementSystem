import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QrCodeCreateDto } from './dto/qr-code.create.dto';
import * as fs from 'fs';
import * as path from 'path';
import * as moment from 'moment-timezone';
import * as QrCode from 'qrcode';
import * as JSZip from 'jszip';
import { DATE_FORMAT, QRCODE_PATH, TIMEZONE } from '../../../shared/contants';
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
            const qrCodeFolder = this.getQrCodeFolder();
            const codeEnitties: QRCodeEntity[] = [];

            for (let item = 0; item < request.quantity; item++) {
                const qrKey: string = `qrcode${item}_${moment().tz(TIMEZONE).format(DATE_FORMAT)}_${moment().valueOf()}`;
                const qrContent: string = `QR_code_${qrKey}`;
                await QrCode.toFile(`${qrCodeFolder}/${qrKey}.png`, qrContent);

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
     * Create qrcode folder if not exist.
     */
    private getQrCodeFolder(): string {
        const currentDate: string = moment().tz(TIMEZONE).format(DATE_FORMAT);
        const dir = `${QRCODE_PATH}${currentDate}`;

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            Logger.log(`Create new folder ${currentDate}`);
        }

        return dir;
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

    async zipQrCodeList(request: QrCodeListDto): Promise<Buffer> {
        try {
            const zip: JSZip = new JSZip();
            const qrEntities: QRCodeEntity[] = [];

            for (const code of request.codeValues) {
                const qrCode = await this.codeRepository.findOne({ where: { code_value: code } });

                if (qrCode) {
                    const dateCreate: string = moment(qrCode.date_create_at).tz(TIMEZONE).format(DATE_FORMAT);
                    const fileName: string = `qr-code/${dateCreate}/${qrCode.code_value}.png`;
                    const qrFile: Buffer = fs.readFileSync(path.join(process.cwd(), fileName));
                    zip.file(`${qrCode.code_value}.png`, qrFile);
                    qrEntities.push(qrCode);
                }
            }

            if (qrEntities.length > 0) {
                return await zip.generateAsync({ type: 'nodebuffer' });
            }

            return new Buffer('');
        } catch (error) {
            Logger.log(error);
            throw new InternalServerErrorException();
        }
    }
}
