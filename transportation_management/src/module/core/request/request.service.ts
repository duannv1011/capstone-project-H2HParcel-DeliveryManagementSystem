import { HttpStatus, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';
import { RequestUpdateDto } from './dto/request.update.dto';
import { Paging } from '../../response/Paging';
import { RequestRecord } from './response/request-record.response';
import { Builder } from 'builder-pattern';
import { RequestRecordEntity } from '../../../entities/request-record.entity';
import { StaffEntity } from '../../../entities/staff.entity';
import { UserLoginData } from '../authentication/dto/user_login_data';
import { RequestEntity } from '../../../entities/request.entity';
import { RequestStatusEntity } from '../../../entities/request-status.entity';
import { RequestStatus } from '../../../enum/request-status.enum';
import { StaffUpdateRequestStastus } from './dto/staff-reslove-order-update';
import { createTransitRequestDto } from './dto/staff-create-transit.dto';
import { TransitEntity } from 'src/entities/transit.entity';
import { OrderEntity } from 'src/entities/order.entity';
import { ActivityLogEntity } from 'src/entities/activity-log.entity';
import { ActivityLogStatusEntity } from 'src/entities/activity-log-status.entity';
import { OrderStatusEntity } from 'src/entities/order-status.entity';
import { WarehouseEntity } from 'src/entities/warehouse.entity';
@Injectable()
export class RequestService {
    constructor(
        private dataSource: DataSource,
        @InjectRepository(RequestRecordEntity)
        private requestRecordRepository: Repository<RequestRecordEntity>,
        @InjectRepository(TransitEntity)
        private transitRecordRepository: Repository<TransitEntity>,
        @InjectRepository(RequestEntity)
        private requestRepository: Repository<RequestEntity>,
        @InjectRepository(StaffEntity)
        private staffRepository: Repository<StaffEntity>,
        @InjectRepository(OrderEntity)
        private orderRepository: Repository<OrderEntity>,
    ) {}

    pageSize = Number(process.env.PAGESIZE);

    /**
     * Find all request.
     */
    async getAllReqeustByWarehouseId(pageNo: number, accId: number) {
        const pageSize = Number(process.env.PAGE_SIZE);
        const staff = await this.staffRepository.findOneBy({ accId: accId });
        const [lists, count] = await this.requestRecordRepository
            .createQueryBuilder('record')
            .leftJoinAndSelect('record.requests', 'request') // Join RequestEntity
            .leftJoinAndSelect('record.transits', 'transit')
            .leftJoinAndSelect('transit.staff', 's')
            .leftJoinAndSelect('transit.warehoueFromTable', 'whf')
            .leftJoinAndSelect('transit.warehoueToTable', 'wht')
            .leftJoinAndSelect('record.requestTypeTable', 'rqt')
            .leftJoinAndSelect('record.requestStatus', 'rqs')
            .leftJoinAndSelect('request.order', 'order')
            .leftJoinAndSelect('order.pickupInformation', 'pickupInformation')
            .leftJoinAndSelect('request.deliverInformation', 'requestdeli')
            .leftJoinAndSelect('requestdeli.address', 'daddress')
            .leftJoinAndSelect('daddress.city', 'dcity')
            .leftJoinAndSelect('daddress.district', 'ddistrict')
            .leftJoinAndSelect('daddress.ward', 'dward')
            .leftJoinAndSelect('pickupInformation.address', 'address')
            .leftJoinAndSelect('address.city', 'city')
            .leftJoinAndSelect('address.district', 'district')
            .leftJoinAndSelect('address.ward', 'ward')
            .where(
                new Brackets((db) => {
                    db.where('ward.warehouse_id = :warehouseId', { warehouseId: staff.warehouseId })
                        .orWhere('transit.warehouse_to = :warehouseTo', { warehouseTo: staff.warehouseId })
                        .orWhere('transit.warehouse_from = :warehouseFrom', { warehouseFrom: staff.warehouseId });
                }),
            )
            .skip((pageNo - 1) * pageSize)
            .take(pageSize)
            .getManyAndCount();
        const response = lists.map((item) => ({
            recordId: item.recordId ? item.recordId : '',
            requestTypeId: item.requestTypeTable ? item.requestTypeTable.requestTypeId : '',
            requestType: item.requestTypeTable ? item.requestTypeTable.requestTypeName : '',
            requesStatusId: item.requestStatus ? item.requestStatus.rqs_id : '',
            requesStatus: item.requestStatus ? item.requestStatus.rqs_name : '',
            transitdata: item.transits
                ? {
                      warehoueFromId: item.transits ? item.transits.warehoueFromTable.warehouseId : '',
                      warehoueFrom: item.transits ? item.transits.warehoueFromTable.warehouseName : '',
                      warehoueToId: item.transits ? item.transits.warehoueToTable.warehouseId : '',
                      warehoueTo: item.transits ? item.transits.warehoueToTable.warehouseName : '',
                      staffId: item.transits ? item.transits.staff.staffId : '',
                      staff: item.transits ? item.transits.staff.fullname : '',
                  }
                : '',

            requestdata: item.requests
                ? {
                      orderId: item.requests ? item.requests.orderId : '',
                      inforId: item.requests.deliverInformation ? item.requests.deliverInformation.inforId : '',
                      name: item.requests.deliverInformation ? item.requests.deliverInformation.name : '',
                      phone: item.requests.deliverInformation ? item.requests.deliverInformation.phone : '',
                      house: item.requests.deliverInformation ? item.requests.deliverInformation.address.house : '',
                      city: item.requests.deliverInformation
                          ? item.requests.deliverInformation.address.city.cityName
                          : '',
                      district: item.requests.deliverInformation
                          ? item.requests.deliverInformation.address.district.districtName
                          : '',
                      ward: item.requests.deliverInformation
                          ? item.requests.deliverInformation.address.ward.wardName
                          : '',
                  }
                : '',
            note: item.note,
            date_created: item.date_create_at ? item.date_create_at : '',
        }));
        const paging = new Paging(pageNo, pageSize, count);
        return { data: response, pages: paging };
    }
    async getAllReqeustByWarehouseIdSearch(pageNo: number, accId: number, requestStatus: number, requestType: number) {
        const pageSize = Number(process.env.PAGE_SIZE);
        const staff = await this.staffRepository.findOneBy({ accId: accId });
        const queryBuilder = await this.requestRecordRepository
            .createQueryBuilder('record')
            .leftJoinAndSelect('record.requests', 'request') // Join RequestEntity
            .leftJoinAndSelect('record.transits', 'transit')
            .leftJoinAndSelect('transit.staff', 's')
            .leftJoinAndSelect('transit.warehoueFromTable', 'whf')
            .leftJoinAndSelect('transit.warehoueToTable', 'wht')
            .leftJoinAndSelect('record.requestTypeTable', 'rqt')
            .leftJoinAndSelect('record.requestStatus', 'rqs')
            .leftJoinAndSelect('request.order', 'order')
            .leftJoinAndSelect('order.pickupInformation', 'pickupInformation')
            .leftJoinAndSelect('request.deliverInformation', 'requestdeli')
            .leftJoinAndSelect('requestdeli.address', 'daddress')
            .leftJoinAndSelect('daddress.city', 'dcity')
            .leftJoinAndSelect('daddress.district', 'ddistrict')
            .leftJoinAndSelect('daddress.ward', 'dward')
            .leftJoinAndSelect('pickupInformation.address', 'address')
            .leftJoinAndSelect('address.city', 'city')
            .leftJoinAndSelect('address.district', 'district')
            .leftJoinAndSelect('address.ward', 'ward')
            .where(
                new Brackets((db) => {
                    db.where('ward.warehouse_id = :warehouseId', { warehouseId: staff.warehouseId })
                        .orWhere('transit.warehouse_to = :warehouseTo', { warehouseTo: staff.warehouseId })
                        .orWhere('transit.warehouse_from = :warehouseFrom', { warehouseFrom: staff.warehouseId });
                }),
            )
            .skip((pageNo - 1) * pageSize)
            .take(pageSize);
        if (requestStatus != 0) {
            queryBuilder.andWhere('record.request_stt = :requestStatus', { requestStatus: requestStatus });
        }
        if (requestType != 0) {
            queryBuilder.andWhere('record.request_type = :requestType', { requestType: requestType });
        }
        queryBuilder.orderBy('record.recordId', 'DESC');
        const [lists, count] = await queryBuilder.getManyAndCount();
        // return lists;
        const response = lists.map((item) => ({
            recordId: item.recordId ? item.recordId : '',
            requestTypeId: item.requestTypeTable ? item.requestTypeTable.requestTypeId : '',
            requestType: item.requestTypeTable ? item.requestTypeTable.requestTypeName : '',
            requesStatusId: item.requestStatus ? item.requestStatus.rqs_id : '',
            requesStatus: item.requestStatus ? item.requestStatus.rqs_name : '',
            transitdata: item.transits
                ? {
                      warehoueFromId: item.transits ? item.transits.warehoueFromTable.warehouseId : '',
                      warehoueFrom: item.transits ? item.transits.warehoueFromTable.warehouseName : '',
                      warehoueToId: item.transits ? item.transits.warehoueToTable.warehouseId : '',
                      warehoueTo: item.transits ? item.transits.warehoueToTable.warehouseName : '',
                      staffId: item.transits ? item.transits.staff.staffId : '',
                      staff: item.transits ? item.transits.staff.fullname : '',
                  }
                : '',

            requestdata: item.requests
                ? {
                      orderId: item.requests ? item.requests.orderId : '',
                      inforId: item.requests.deliverInformation ? item.requests.deliverInformation.inforId : '',
                      name: item.requests.deliverInformation ? item.requests.deliverInformation.name : '',
                      phone: item.requests.deliverInformation ? item.requests.deliverInformation.phone : '',
                      house: item.requests.deliverInformation ? item.requests.deliverInformation.address.house : '',
                      city: item.requests.deliverInformation
                          ? item.requests.deliverInformation.address.city.cityName
                          : '',
                      district: item.requests.deliverInformation
                          ? item.requests.deliverInformation.address.district.districtName
                          : '',
                      ward: item.requests.deliverInformation
                          ? item.requests.deliverInformation.address.ward.wardName
                          : '',
                  }
                : '',
            note: item.note,
            date_created: item.date_create_at ? item.date_create_at : '',
        }));
        const paging = new Paging(pageNo, pageSize, count);
        return { data: response, pages: paging };
    }

    /**
     * Find request detail.
     *
     * @param recordId
     */
    async findRequestRecordDetail(recordId: number) {
        try {
            const record = await this.requestRecordRepository
                .createQueryBuilder('record')
                .leftJoinAndSelect('record.requests', 'request') // Join RequestEntity
                .leftJoinAndSelect('record.transits', 'transit')
                .leftJoinAndSelect('transit.staff', 's')
                .leftJoinAndSelect('transit.warehoueFromTable', 'whf')
                .leftJoinAndSelect('transit.warehoueToTable', 'wht')
                .leftJoinAndSelect('record.requestTypeTable', 'rqt')
                .leftJoinAndSelect('record.requestStatus', 'rqs')
                .leftJoinAndSelect('request.order', 'order')
                .leftJoinAndSelect('order.pickupInformation', 'pickupInformation')
                .leftJoinAndSelect('request.deliverInformation', 'requestdeli')
                .leftJoinAndSelect('requestdeli.address', 'address')
                .leftJoinAndSelect('address.city', 'city')
                .leftJoinAndSelect('address.district', 'district')
                .leftJoinAndSelect('address.ward', 'ward')
                .where('record.record_id = :recordId', { recordId: recordId })
                .getOne();
            const response = record
                ? {
                      recordId: record.recordId ? record.recordId : '',
                      requestTypeId: record.requestTypeTable ? record.requestTypeTable.requestTypeId : '',
                      requestType: record.requestTypeTable ? record.requestTypeTable.requestTypeName : '',
                      requesStatusId: record.requestStatus ? record.requestStatus.rqs_id : '',
                      requesStatus: record.requestStatus ? record.requestStatus.rqs_name : '',
                      transitdata: record.transits
                          ? {
                                warehoueFromId: record.transits ? record.transits.warehoueFromTable.warehouseId : '',
                                warehoueFrom: record.transits ? record.transits.warehoueFromTable.warehouseName : '',
                                warehoueToId: record.transits ? record.transits.warehoueToTable.warehouseId : '',
                                warehoueTo: record.transits ? record.transits.warehoueToTable.warehouseName : '',
                                staffId: record.transits ? record.transits.staff.staffId : '',
                                staff: record.transits ? record.transits.staff.fullname : '',
                            }
                          : '',

                      requestdata: record.requests
                          ? {
                                orderId: record.requests ? record.requests.orderId : '',
                                inforId: record.requests.deliverInformation.inforId,
                                name: record.requests.deliverInformation.name,
                                phone: record.requests.deliverInformation.phone,
                                house: record.requests.deliverInformation.address.house,
                                city: record.requests.deliverInformation.address.city.cityName,
                                district: record.requests.deliverInformation.address.district.districtName,
                                ward: record.requests.deliverInformation.address.ward.wardName,
                            }
                          : '',
                      note: record.note,
                      date_created: record.date_create_at ? record.date_create_at : '',
                  }
                : null;
            return response;
        } catch (error) {
            Logger.log(error);
            throw new InternalServerErrorException();
        }
    }

    /**
     * Update request.
     *
     * @param request RequestUpdateDto
     */
    async updateRequest(request: RequestUpdateDto): Promise<boolean> {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const requestRecord = await this.requestRecordRepository.findOne({
                where: { recordId: request.recordId },
            });

            if (requestRecord) {
                if (request.requestType) {
                    requestRecord.requestType = request.requestType;
                }

                if (request.requestStatus) {
                    requestRecord.requestStt = request.requestStatus;
                }

                if (request.note) {
                    requestRecord.note = request.note;
                }
                await queryRunner.manager.save(requestRecord);
                // error here
                const requestEntity = await this.requestRepository.findOne({
                    where: { requestId: request.recordId },
                });

                if (requestEntity) {
                    if (request.deliverInfoId) {
                        requestEntity.deliverInfor = request.deliverInfoId;
                    }

                    if (request.orderId) {
                        requestEntity.order.orderId = request.orderId;
                    }

                    await queryRunner.manager.save(requestEntity);
                }

                await queryRunner.commitTransaction();
                return true;
            }

            return false;
        } catch (error) {
            Logger.error(error);
            await queryRunner.rollbackTransaction();
            return false;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Cancel request.
     *
     * @param recordId
     */
    async cancelRequest(recordId: number): Promise<boolean> {
        try {
            const requestCancel = await this.requestRecordRepository.findOne({ where: { recordId: recordId } });
            if (requestCancel) {
                requestCancel.requestStt = RequestStatus.DENIED;
                await this.requestRecordRepository.update(recordId, requestCancel);

                return true;
            }

            return false;
        } catch (error) {
            Logger.log(error);
            throw new InternalServerErrorException();
        }
    }

    private toRequestRecord(entity?: any): RequestRecord {
        if (entity) {
            const orderId = entity.request ? (entity.request.orderId ? entity.request.orderId : null) : null;
            const deliverName = entity.request
                ? entity.request.deliverInformation
                    ? entity.request.deliverInformation.name
                    : ''
                : '';
            const requestType = entity.requestType ? entity.requestType.requestTypeName : '';
            const requestStatus = entity.requestStatus ? entity.requestStatus.rqsName : '';

            return Builder<RequestRecord>()
                .requestRecordId(entity.recordId)
                .requestId(entity.referId)
                .orderId(orderId)
                .deliverName(deliverName)
                .requestType(requestType)
                .requestStatus(requestStatus)
                .note(entity.note)
                .build();
        }

        return Builder<RequestRecord>().build();
    }

    /**
     * Get staff info by staff login.
     *
     * @param userLogin UserLoginData
     */
    private async getStaff(userLogin: UserLoginData): Promise<StaffEntity> {
        const staff = await this.staffRepository.findOne({ where: { accId: userLogin.accId } });

        if (staff) {
            return staff;
        }

        return null;
    }

    async resloveOrder(data: StaffUpdateRequestStastus, accId: number) {
        const reqest = await this.requestRepository.findOneBy({ recordId: data.recordId });
        const order = await this.orderRepository.findOneBy({ orderId: reqest.orderId });
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        const reqRc = reqest.requesrRecord;
        if (order.orderStt > 4) {
            return 'The order has left the warehouse.';
        }

        if (data.requestStatus === 1 || reqRc.requestStt > 1) {
            return 'iligal value for requestStatus';
        }
        reqRc.requestStt = data.requestStatus;
        const reqstt = new RequestStatusEntity();
        reqstt.rqs_id = data.requestStatus;
        reqRc.requestStatus = reqstt;
        if (data.requestStatus === 3) {
            //update deniel status
            await queryRunner.manager.save(reqRc);
            if (reqRc.requestType === 1) {
                //create ActivityLog for update deniel
                const activityLog = await this.ActivitylogOrder(order.orderId, 12, accId);
                await queryRunner.manager.save(ActivityLogEntity, activityLog);
            }
            if (reqRc.requestType === 2) {
                //create ActivityLog for cancel deniel
                const activityLog = await this.ActivitylogOrder(order.orderId, 15, accId);
                await queryRunner.manager.save(ActivityLogEntity, activityLog);
            }
            await queryRunner.commitTransaction();
            return 'denied Success';
        } else {
            try {
                if (reqRc.requestType === 1) {
                    //accept edit
                    //update order
                    const information = reqest.deliverInformation;
                    order.deliverInformation = information;
                    order.estimatedPrice = reqest.new_price;
                    //
                    await queryRunner.manager.save(order);
                    // update RequestStatus to aporve
                    await queryRunner.manager.save(reqRc);
                    //create ActivityLog
                    const activityLog = await this.ActivitylogOrder(order.orderId, 11, accId);
                    await queryRunner.manager.save(ActivityLogEntity, activityLog);
                    await queryRunner.commitTransaction();
                    return ' aproved update successfull';
                }
                if (reqRc.requestType === 2) {
                    //accept cancel
                    //update order step1
                    order.deliverInformation = order.pickupInformation;
                    const newPrice = order.estimatedPrice * 0.4;
                    order.estimatedPrice = newPrice;
                    const orderStatus = new OrderStatusEntity();
                    orderStatus.sttId = 10;
                    order.status = orderStatus;
                    await queryRunner.manager.save(order);
                    // update RequestStatus to aporve of requestRecord Table
                    await queryRunner.manager.save(reqRc);
                    // crreate log update
                    //create ActivityLog step1 aprove cancle log
                    const activityLog = await this.ActivitylogOrder(order.orderId, 14, accId);
                    await queryRunner.manager.save(ActivityLogEntity, activityLog);
                    //end stepp
                    // start step2
                    // update order step2
                    orderStatus.sttId = 8;
                    order.status = orderStatus;
                    await queryRunner.manager.save(order);
                    //create ActivityLog step2
                    const activityLog2: ActivityLogEntity = Object.assign(activityLog);
                    activityLog2.logId = 0;
                    activityLog2.currentStatus = 16;
                    await queryRunner.manager.save(ActivityLogEntity, activityLog2);
                    //create ActivityLog step3
                    const activityLog3: ActivityLogEntity = Object.assign(activityLog);
                    activityLog3.logId = 0;
                    activityLog3.currentStatus = 17;
                    await queryRunner.manager.save(ActivityLogEntity, activityLog3);
                    await queryRunner.commitTransaction();
                    return 'aproved Cancel successfull';
                }
            } catch (error) {
                Logger.error(error);
                await queryRunner.rollbackTransaction();
                throw new InternalServerErrorException();
            } finally {
                await queryRunner.release();
            }
        }
    }

    async createTransitRequest(data: createTransitRequestDto, accId: number) {
        const staff = await this.staffRepository.findOneBy({ accId: accId });
        const orders = await this.orderRepository
            .createQueryBuilder('o')
            .leftJoin('o.deliverInformation', 'od')
            .leftJoin('od.address', 'a')
            .leftJoin('a.ward', 'w')
            .select(['o.orderId', 'o.transitShipperId'])
            .leftJoinAndSelect(WarehouseEntity, 'wh', 'w.warehouse_id = wh.warehouse_id')
            .where('o.transit_shipper_id is  null')
            .andWhere('o.order_stt = :orderStatus', { orderStatus: 4 })
            .andWhere('wh.warehouse_id = :warehouseId', { warehouseId: data.warehouseTo })
            .getMany();
        if (!Array.isArray(orders) || orders.length === 0) {
            return { status: 404, msg: 'no order match' };
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            //create requestRecord
            const requestRecord = new RequestRecordEntity();
            requestRecord.recordId = 0;
            requestRecord.requestStt = 2;
            requestRecord.requestType = 3;
            requestRecord.note = data.note;
            const requestRecordCreated = await queryRunner.manager.save(requestRecord);
            //create Transit
            const transit = new TransitEntity();
            transit.transitId = 0;
            transit.recordId = requestRecordCreated.recordId;
            transit.staffId = data.transitShiper;
            transit.warehouseFrom = staff.warehouseId;
            transit.warehouseTo = data.warehouseTo;
            const transitCreate = await queryRunner.manager.save(transit);
            const warehouse = await queryRunner.manager.findOneBy(WarehouseEntity, { warehouseId: data.warehouseTo });
            //update all have orderstatus =4 and deliver_warehouse  = data.warehouseTo
            //get all legal to insert

            orders.map((order) => {
                order.transitShipperId = transitCreate.staffId;
            });
            const updateOrder = orders ? await queryRunner.manager.save(orders) : 0;
            if (updateOrder === 0) {
                return { status: HttpStatus.CONFLICT, msg: 'update order data error' };
            }
            await queryRunner.commitTransaction();
            const shipper = await this.staffRepository.findOneBy({ staffId: data.transitShiper });
            return {
                status: HttpStatus.OK,
                msg: `${shipper.fullname} is assigned to transition to ${warehouse.warehouseName}`,
            };
        } catch (error) {
            Logger.log(error);
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
    async transitUpdateStatus(request_id: number) {
        const request = await this.requestRepository.findOneBy({ requestId: request_id });
        const rqRecord = await this.requestRecordRepository.findOneBy({ recordId: request.recordId });
        if (rqRecord.requestStt && rqRecord.requestStt < 2) {
            rqRecord.requestStt++;
            await this.requestRecordRepository.update(request.recordId, rqRecord);
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
