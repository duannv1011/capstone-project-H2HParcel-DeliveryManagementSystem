import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { RequestUpdateDto } from './dto/request.update.dto';
import { Paging } from '../../response/Paging';
import { RequestRecord, RequestRecordDetailResponse, RequestRecordResponse } from './response/request-record.response';
import { Builder } from 'builder-pattern';
import { RequestRecordEntity } from '../../../entities/request-record.entity';
import { StaffEntity } from '../../../entities/staff.entity';
import { UserLoginData } from '../authentication/dto/user_login_data';
import { RequestEntity } from '../../../entities/request.entity';
import { RequestTypeEntity } from '../../../entities/request-type.entity';
import { RequestStatusEntity } from '../../../entities/request-status.entity';
import { InformationEntity } from '../../../entities/information.entity';
import { RequestStatus } from '../../../enum/request-status.enum';
import { UpdateOrderCustomer } from './dto/staff-reslove-order-update';
import { createTransitRequestDto } from './dto/staff-create-transit.dto';
import { TransitEntity } from 'src/entities/transit.entity';

@Injectable()
export class RequestService {
    constructor(
        private dataSource: DataSource,
        @InjectRepository(RequestRecordEntity)
        private requestRecordRepository: Repository<RequestRecordEntity>,
        @InjectRepository(RequestEntity)
        private requestRepository: Repository<RequestEntity>,
        @InjectRepository(StaffEntity)
        private staffRepository: Repository<StaffEntity>,
    ) {}

    pageSize = Number(process.env.PAGESIZE);

    /**
     * Find all request.
     */
    async findRequestByOrder(pageNo: number): Promise<RequestRecordResponse> {
        try {
            const [requestRecords, total] = await this.requestRecordRepository
                .createQueryBuilder()
                .select('requestRecord')
                .from(RequestRecordEntity, 'requestRecord')
                .leftJoinAndMapOne(
                    'requestRecord.request',
                    RequestEntity,
                    'request',
                    'requestRecord.referId = request.requestId',
                )
                .leftJoinAndMapOne(
                    'request.deliverInformation',
                    InformationEntity,
                    'deliverInformation',
                    'request.deliverInfor = deliverInformation.inforId',
                )
                .leftJoinAndMapOne(
                    'requestRecord.requestType',
                    RequestTypeEntity,
                    'requestType',
                    'requestRecord.requestType = requestType.rtId',
                )
                .leftJoinAndMapOne(
                    'requestRecord.requestStatus',
                    RequestStatusEntity,
                    'requestStatus',
                    'requestRecord.requestStt = requestStatus.rqsId',
                )
                .andWhere('requestStatus.rqsId IN (:...requestStatusIn)', {
                    requestStatusIn: [RequestStatus.PROCESSING, RequestStatus.APPROVED],
                })
                .skip((pageNo - 1) * this.pageSize)
                .take(this.pageSize)
                .getManyAndCount();

            const requestRecordList = [];
            requestRecords.forEach((element) => {
                requestRecordList.push(this.toRequestRecord(element));
            });

            const paging: Paging = new Paging(pageNo, this.pageSize, total);

            return { records: requestRecordList, paging: paging };
        } catch (error) {
            Logger.log(error);
            throw new InternalServerErrorException();
        }
    }

    /**
     * Find request detail.
     *
     * @param recordId
     */
    async findRequestRecordDetail(recordId: number): Promise<RequestRecordDetailResponse> {
        try {
            const record = await this.requestRecordRepository
                .createQueryBuilder()
                .select('requestRecord')
                .from(RequestRecordEntity, 'requestRecord')
                .leftJoinAndMapOne(
                    'requestRecord.request',
                    RequestEntity,
                    'request',
                    'requestRecord.referId = request.requestId',
                )
                .leftJoinAndMapOne(
                    'request.deliverInformation',
                    InformationEntity,
                    'deliverInformation',
                    'request.deliverInfor = deliverInformation.inforId',
                )
                .leftJoinAndMapOne(
                    'requestRecord.requestType',
                    RequestTypeEntity,
                    'requestType',
                    'requestRecord.requestType = requestType.rtId',
                )
                .leftJoinAndMapOne(
                    'requestRecord.requestStatus',
                    RequestStatusEntity,
                    'requestStatus',
                    'requestRecord.requestStt = requestStatus.rqsId',
                )
                .where('requestRecord.recordId = :recordId', { recordId: recordId })
                .andWhere('requestStatus.rqsId IN (:...requestStatusIn)', {
                    requestStatusIn: [RequestStatus.PROCESSING, RequestStatus.APPROVED],
                })
                .getOne();

            return { record: this.toRequestRecord(record) };
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

    async resloveOrder(data: UpdateOrderCustomer, accId: number) {}

    async createTransitRequest(data: createTransitRequestDto, accId: number) {
        const staff = await this.staffRepository.findOneBy({ accId: accId });
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
            await queryRunner.manager.save(transit);
            await queryRunner.commitTransaction();
            return `${staff.fullname} is assigned to transition to ${transit.warehouseTo}`;
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
}
