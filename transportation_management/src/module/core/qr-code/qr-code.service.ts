import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { QrCodeCreateDto } from './dto/qr-code.create.dto';
import * as moment from 'moment-timezone';
import * as JSZip from 'jszip';
import * as QrCodeGenerator from 'qrcode';
import { DATE_FORMAT, TIMEZONE } from '../../../shared/contants';
import { QRCodeEntity } from '../../../entities/qrcode.entity';
import { QrCodeListDto } from './dto/qr-code.list.dto';
import { Builder } from 'builder-pattern';
import { QrCode, QrCodeCreate, QrCodeDetailResponse } from './reponse/qr-code.response';
import { Paging } from '../../response/Paging';
import { AssignCodeDto } from './dto/assign-code.dto';
import { OrderEntity } from '../../../entities/order.entity';
import { ScanQrDto } from './dto/scan-qr-code.dto';
import { StaffEntity } from 'src/entities/staff.entity';
import { ActivityLogEntity } from 'src/entities/activity-log.entity';
import { ActivityLogStatusEntity } from 'src/entities/activity-log-status.entity';
import { OrderStatusEntity } from 'src/entities/order-status.entity';
import { WarehouseEntity } from 'src/entities/warehouse.entity';


@Injectable()
export class QrCodeService {
    constructor(
        @InjectRepository(QRCodeEntity)
        private codeRepository: Repository<QRCodeEntity>,
        @InjectRepository(OrderEntity)
        private orderRepository: Repository<OrderEntity>,
        @InjectRepository(StaffEntity)
        private staffRepository: Repository<StaffEntity>,
        @InjectRepository(OrderStatusEntity)
        private orderStatusRepository: Repository<OrderStatusEntity>,
        private dataSource: DataSource,
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
                entity.codeValue = qrKey;
                entity.qrUrl = `qr-code/${moment().tz(TIMEZONE).format(DATE_FORMAT)}/${qrKey}.png`;
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
    async findAllQrCode(pageNo: number): Promise<any> {
        try {
            const [qrCodes, total] = await this.codeRepository
                .createQueryBuilder('code')
                .leftJoinAndSelect('code.order', 'order')
                .orderBy('code.order', 'DESC')
                .addOrderBy('code.date_create_at', 'DESC')
                .addOrderBy('code.codeId', 'DESC')
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
                where: { codeValue: codeValue },
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
                const qrCode = await this.codeRepository.findOne({ where: { codeValue: code } });

                if (qrCode) {
                    const imageName = `${qrCode.codeValue}.png`;
                    let orderId: number = null;
                    if (qrCode.order) {
                        orderId = qrCode.order.orderId;
                    }
                    const qrContent = `{ codeValue: ${qrCode.codeValue}, orderId: ${orderId} }`;
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
    async assignCodeToOrder(request: AssignCodeDto, accId) {
        const code = await this.codeRepository.findOne({ where: { codeValue: request.codeValue } });
        const orderdata = await this.orderRepository.findOneBy({ orderId: request.orderId });
        if (!code) {
            return 'code value not found';
        }
        if (code.order) {
            return 'code is asigned please asign new QR code';
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            //update code tale
            const order = new OrderEntity();
            order.orderId = request.orderId;
            code.order = order;
            code.price = orderdata.estimatedPrice.toString();
            code.qrUrl = '';
            await queryRunner.manager.save(code);
            // update order status
            const orderStaus = new OrderStatusEntity();
            orderStaus.sttId = 3;
            orderdata.status = orderStaus;
            orderdata.orderStt = 3;
            await queryRunner.manager.save(OrderEntity, orderdata);
            //create ActivityLog
            const activityLog = await this.ActivitylogOrder(order.orderId, orderStaus.sttId, accId);
            await queryRunner.manager.save(ActivityLogEntity, activityLog);
            await queryRunner.commitTransaction();
            return `order: ${order.orderId} is asign to qr: ${code.codeValue}`;
        } catch (error) {
            console.error('Error occurred:', error);
            await queryRunner.rollbackTransaction();
            return 'Error occurred while assigning code to order';
        } finally {
            await queryRunner.release();
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
                .codeId(entity.codeId)
                .codeValue(entity.codeValue)
                .qrUrl(entity.qrUrl)
                .price(entity.price ? entity.price : '0')
                .dateCreateAt(entity.date_create_at)
                .orderId(orderId)
                .build();
        }

        return Builder<QrCode>().build();
    }

    async scanQR(data: ScanQrDto, accId: number) {
        const staff = await this.staffRepository.findOneBy({ accId: accId });
        if (!staff) {
            return 'staff not found';
        }
        const code = await this.codeRepository
            .createQueryBuilder('qr')
            .leftJoinAndSelect('qr.order', 'o')
            .where('qr.code_value =:codeValue', { codeValue: data.qrCode })
            .getOne();
        if (!code || !code.order) {
            return 'code not found or is not asigned any order';
        }
        const statusId = Number(code.order.orderStt);
        if (7 < statusId || statusId < 3) {
            return 'can not Scan this Order';
        }
        const order = await this.orderRepository.findOneBy({ orderId: code.order.orderId });
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const orderStatus = new OrderStatusEntity();
            if ([3, 5].includes(statusId) && [3, 4].includes(staff.account.role.roleId)) {
                //update order
                orderStatus.sttId = order.orderStt + 1;
                order.status = orderStatus;
                const orderUpdate = await queryRunner.manager.save(order);
                const ordordata = await this.orderRepository
                    .createQueryBuilder('o')
                    .leftJoin('o.deliverInformation', 'di')
                    .leftJoin('di.address', 'dia')
                    .leftJoin('dia.ward', 'diw')
                    .leftJoinAndSelect(WarehouseEntity, 'warehouse', 'diw.warehouse_id = warehouse.warehouse_id')
                    .select(['o.order_id', 'warehouse.warehouse_name'])
                    .getRawMany();
                //create ActivityLog
                const activityLog = await this.ActivitylogOrder(order.orderId, orderUpdate.orderStt, accId);
                await queryRunner.manager.save(activityLog);
                await queryRunner.commitTransaction();
                const stt = await this.orderStatusRepository.findOneBy({ sttId: orderStatus.sttId });
                return {
                    order: orderUpdate.hasId,
                    msg: `Order updated successfully to:${stt.sttName}`,
                    orderdata: { ordordata },
                };
            } else if ([4, 7].includes(statusId) && staff.account.role.roleId === 2) {
                //update order
                orderStatus.sttId = order.orderStt + 1;
                order.status = orderStatus;
                const orderUpdate = await queryRunner.manager.save(order);
                //create ActivityLog
                const activityLog = await this.ActivitylogOrder(order.orderId, orderUpdate.orderStt, accId);
                await queryRunner.manager.save(activityLog);
                await queryRunner.commitTransaction();
                const stt = await this.orderStatusRepository.findOneBy({ sttId: orderStatus.sttId });
                return { order: orderUpdate.hasId, msg: `Order updated successfully to:${stt.sttName}` };
            } else {
                return 'can not Scan this Order';
            }
        } catch (error) {
            await queryRunner.rollbackTransaction();
            return error;
        } finally {
            await queryRunner.release();
        }
    }

    async ActivitylogOrder(orderId: number, status: number, accId: number): Promise<ActivityLogEntity> {
        const activityLog = new ActivityLogEntity();
        const activitystatus = new ActivityLogStatusEntity();
        activityLog.logId = 0;
        activityLog.orderId = orderId;
        activityLog.currentStatus = status;
        activitystatus.alsttId = status;
        activityLog.accId = accId;
        activityLog.time = new Date();
        return activityLog;
    }
}
