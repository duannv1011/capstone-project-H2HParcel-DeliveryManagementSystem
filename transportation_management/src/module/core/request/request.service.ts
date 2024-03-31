import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestCreateDto } from './dto/request.create.dto';
import { RequestUpdateDto } from './dto/request.update.dto';
import { Paging } from '../../response/Paging';
import {
    RequestRecord,
    RequestRecordDetailResponse,
    RequestRecordResponse,
    RequestTransitRecord,
    RequestTransitRecordResponse,
} from './response/request-record.response';
import { Builder } from 'builder-pattern';
import { RequestRecordEntity } from '../../../entities/request-record.entity';
import { StaffEntity } from '../../../entities/staff.entity';
import { UserLoginData } from '../authentication/dto/user_login_data';
import { RequestEntity } from '../../../entities/request.entity';
import { RequestTypeEntity } from '../../../entities/request-type.entity';
import { RequestStatusEntity } from '../../../entities/request-status.entity';
import { InformationEntity } from '../../../entities/Information.entity';
import { TransitEntity } from '../../../entities/transit.entity';
import { RequestStatus } from '../../../enum/request-status.enum';

@Injectable()
export class RequestService {
    constructor(
        @InjectRepository(RequestRecordEntity)
        private requestRecordRepository: Repository<RequestRecordEntity>,
        @InjectRepository(StaffEntity)
        private staffRepository: Repository<StaffEntity>,
    ) {}

    pageSize = Number(process.env.PAGE_SIZE);

    /**
     * Find all request.
     */
    async findRequestByOrder(orderId: number, pageNo: number): Promise<RequestRecordResponse> {
        try {
            const [requestRecords, total] = await this.requestRecordRepository
                .createQueryBuilder()
                .select('requestRecord')
                .from(RequestRecordEntity, 'requestRecord')
                .leftJoinAndMapOne(
                    'requestRecord.request',
                    RequestEntity,
                    'request',
                    'requestRecord.refer_id = request.request_id',
                )
                .leftJoinAndMapOne(
                    'request.deliverInformation',
                    InformationEntity,
                    'deliverInformation',
                    'request.deliver_infor = deliverInformation.infor_id',
                )
                .leftJoinAndMapOne(
                    'requestRecord.requestType',
                    RequestTypeEntity,
                    'requestType',
                    'requestRecord.request_type = requestType.rt_id',
                )
                .leftJoinAndMapOne(
                    'requestRecord.requestStatus',
                    RequestStatusEntity,
                    'requestStatus',
                    'requestRecord.request_stt = requestStatus.rqs_id',
                )
                .where('request.order_id = :orderId', { orderId: orderId })
                .andWhere('requestStatus.rqs_id IN (:...requestStatusIn)', {
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

    async findTransitByStaff(userLogin: UserLoginData, pageNo: number): Promise<RequestTransitRecordResponse> {
        try {
            const staffId = (await this.getStaff(userLogin)).staff_id;

            if (staffId) {
                const [requestRecords, total] = await this.requestRecordRepository
                    .createQueryBuilder()
                    .select('requestRecord')
                    .from(RequestRecordEntity, 'requestRecord')
                    .leftJoinAndMapOne(
                        'requestRecord.transit',
                        TransitEntity,
                        'transit',
                        'requestRecord.refer_id = transit.transit_id',
                    )
                    .leftJoinAndMapOne(
                        'requestRecord.requestType',
                        RequestTypeEntity,
                        'requestType',
                        'requestRecord.request_type = requestType.rt_id',
                    )
                    .leftJoinAndMapOne(
                        'requestRecord.requestStatus',
                        RequestStatusEntity,
                        'requestStatus',
                        'requestRecord.request_stt = requestStatus.rqs_id',
                    )
                    .where('transit.staff_id = :staffId', { staffId: staffId })
                    .andWhere('requestStatus.rqs_id = :requestStatus', { requestStatus: RequestStatus.DENIED })
                    .skip((pageNo - 1) * this.pageSize)
                    .take(this.pageSize)
                    .getManyAndCount();

                const requestRecordList = [];
                requestRecords.forEach((element) => {
                    requestRecordList.push(this.toTransitRecord(element));
                });

                const paging: Paging = new Paging(pageNo, this.pageSize, total);

                return { records: requestRecordList, paging: paging };
            }

            return { records: [], paging: null };
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
                    'requestRecord.refer_id = request.request_id',
                )
                .leftJoinAndMapOne(
                    'request.deliverInformation',
                    InformationEntity,
                    'deliverInformation',
                    'request.deliver_infor = deliverInformation.infor_id',
                )
                .leftJoinAndMapOne(
                    'requestRecord.requestType',
                    RequestTypeEntity,
                    'requestType',
                    'requestRecord.request_type = requestType.rt_id',
                )
                .leftJoinAndMapOne(
                    'requestRecord.requestStatus',
                    RequestStatusEntity,
                    'requestStatus',
                    'requestRecord.request_stt = requestStatus.rqs_id',
                )
                .where('requestRecord.record_id = :recordId', { recordId: recordId })
                .andWhere('requestStatus.rqs_id IN (:...requestStatusIn)', {
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
     * Create new request by order.
     *
     * @param request RequestCreateDto
     */
    async createRequest(request: RequestCreateDto): Promise<any> {
        try {
            // const requestNew = this.requestRecordRepository.create(request);
            // const result = await requestNew.save();
            // return await this.requestRecordRepository.findOne({ where: { requestId: result.requestId } });
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
        try {
            // await this.requestRecordRepository.update(request.requestId, request);

            return true;
        } catch (error) {
            Logger.log(error);
            throw new InternalServerErrorException();
        }
    }

    /**
     * Cancel request.
     *
     * @param requestId number
     */
    async cancelRequest(requestId: number): Promise<boolean> {
        // try {
        //     const requestCancel = await this.requestRepository.findOne({ where: { requestId: requestId } });
        //     if (requestCancel) {
        //         // TODO: QA request status
        //         requestCancel.re = 5;
        //         await this.requestRepository.update(requestId, requestCancel);

        //         return true;
        //     }

        return false;
        // } catch (error) {
        //     Logger.log(error);
        //     throw new InternalServerErrorException();
        // }
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
            const requestStatus = entity.requestStatus ? entity.requestStatus.rqs_name : '';

            return Builder<RequestRecord>()
                .requestRecordId(entity.record_id)
                .requestId(entity.refer_id)
                .orderId(orderId)
                .deliverName(deliverName)
                .requestType(requestType)
                .requestStatus(requestStatus)
                .note(entity.note)
                .build();
        }

        return Builder<RequestRecord>().build();
    }

    private toTransitRecord(entity?: any): RequestTransitRecord {
        if (entity) {
            const requestType = entity.requestType ? entity.requestType.requestTypeName : '';
            const requestStatus = entity.requestStatus ? entity.requestStatus.rqs_name : '';

            return Builder<RequestTransitRecord>()
                .requestRecordId(entity.record_id)
                .requestId(entity.transit.transit_id)
                .requestType(requestType)
                .requestStatus(requestStatus)
                .note(entity.note)
                .build();
        }

        return Builder<RequestTransitRecord>().build();
    }

    /**
     * Get staff info by staff login.
     *
     * @param userLogin UserLoginData
     */
    private async getStaff(userLogin: UserLoginData): Promise<StaffEntity> {
        const staff = await this.staffRepository.findOne({ where: { acc_id: userLogin.accId } });

        if (staff) {
            return staff;
        }

        return null;
    }
}
