import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QrCodeCreateDto } from './dto/qr-code.create.dto';
import * as moment from 'moment-timezone';
import * as JSZip from 'jszip';
import * as QrCodeGenerator from 'qrcode';
import { DATE_FORMAT, TIMEZONE } from '../../../shared/contants';
import { QRCodeEntity } from '../../../entities/qrcode.entity';
import { QrCodeListDto } from './dto/qr-code.list.dto';
import { Builder } from 'builder-pattern';
import { QrCode, QrCodeCreate, QrCodeDetailResponse, QrCodeResponse } from './reponse/qr-code.response';
import { Paging } from '../../response/Paging';
import { AssignCodeDto } from './dto/assign-code.dto';
import { OrderEntity } from '../../../entities/order.entity';

@Injectable()
export class QrCodeService {
    constructor(
        @InjectRepository(QRCodeEntity)
        private codeRepository: Repository<QRCodeEntity>,
    ) {}

    pageSize = Number(process.env.PAGE_SIZE);

    /**
     * create qr code list.
     *
     * @param request QrCodeCreateDto
     */
    async createQrCode(request: QrCodeCreateDto): Promise<QrCodeCreate> {
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

            return { successQuantity: codeEnitties.length };
        } catch (error) {
            Logger.log(error);
            throw new InternalServerErrorException();
        }
    }

    /**
     * Find all qrcode.
     */
    async findAllQrCode(pageNo: number): Promise<QrCodeResponse> {
        try {
            const [qrCodes, total] = await this.codeRepository
                .createQueryBuilder('code')
                .leftJoinAndSelect('code.order', 'order')
                .orderBy('code.order', 'DESC')
                .addOrderBy('code.date_create_at', 'DESC')
                .skip((pageNo - 1) * this.pageSize)
                .take(this.pageSize)
                .getManyAndCount();

            const qrCodeList = [];
            qrCodes.forEach((element) => {
                qrCodeList.push(this.toQrCode(element));
            });

            const paging: Paging = new Paging(pageNo, this.pageSize, total);

            return { qrCodes: qrCodeList, paging: paging };
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
    async findOneQrCode(codeValue: string): Promise<QrCodeDetailResponse> {
        try {
            const qrCode = await this.codeRepository.findOne({
                where: { code_value: codeValue },
            });

            return { qrCode: this.toQrCode(qrCode) };
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

            for (const code of request.codeValues) {
                const qrCode = await this.codeRepository.findOne({ where: { code_value: code } });

                if (qrCode) {
                    const imageName = `${qrCode.code_value}.png`;
                    let orderId: number = null;
                    if (qrCode.order) {
                        orderId = qrCode.order.orderId;
                    }
                    const qrContent = `{ codeValue: ${qrCode.code_value}, orderId: ${orderId} }`;
                    const qrFile = await QrCodeGenerator.toBuffer(`${qrContent}`);
                    zip.file(imageName, qrFile);
                }
            }

            return await zip.generateAsync({ type: 'nodebuffer' });
        } catch (error) {
            Logger.log(error);
            throw new InternalServerErrorException();
        }
    }

    /**
     * assign Code To Order.
     *
     * @param request AssignCodeCreateDto
     */
    async assignCodeToOrder(request: AssignCodeDto): Promise<boolean> {
        try {
            const code: QRCodeEntity = await this.codeRepository.findOne({ where: { code_value: request.codeValue } });

            if (code) {
                const order: OrderEntity = new OrderEntity();
                order.orderId = request.orderId;
                code.order = order;
                await this.codeRepository.save(code);

                return true;
            }

            return false;
        } catch (error) {
            Logger.log(error);
            throw new InternalServerErrorException();
        }
    }

    /**
     * Transform response qr code.
     *
     * @param entity
     */
    private toQrCode(entity?: QRCodeEntity): QrCode {
        if (entity) {
            const orderId = entity.order ? entity.order.orderId : null;

            return Builder<QrCode>()
                .codeId(entity.code_id)
                .codeValue(entity.code_value)
                .qrUrl(entity.qr_url)
                .price(entity.price ? entity.price : '0')
                .dateCreateAt(entity.date_create_at)
                .orderId(orderId)
                .build();
        }

        return Builder<QrCode>().build();
    }
}
