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
import { InformationEntity } from '../../../entities/Information.entity';
import { RequestStatus } from '../../../enum/request-status.enum';
import { UpdateOrderCustomer } from './dto/customer_update_order.dto';

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

    pageSize = Number(process.env.PAGE_SIZE);

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
                where: { record_id: request.recordId },
            });

            if (requestRecord) {
                if (request.requestType) {
                    requestRecord.request_type = request.requestType;
                }

                if (request.requestStatus) {
                    requestRecord.request_stt = request.requestStatus;
                }

                if (request.note) {
                    requestRecord.note = request.note;
                }
                await queryRunner.manager.save(requestRecord);

                const requestEntity = await this.requestRepository.findOne({
                    where: { requestId: requestRecord.refer_id },
                });

                if (requestEntity) {
                    if (request.deliverInfoId) {
                        requestEntity.deliverInfor = request.deliverInfoId;
                    }

                    if (request.orderId) {
                        requestEntity.order.order_id = request.orderId;
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
            const requestCancel = await this.requestRecordRepository.findOne({ where: { record_id: recordId } });
            if (requestCancel) {
                requestCancel.request_stt = RequestStatus.DENIED;
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
    async updateOrder(data: UpdateOrderCustomer, acc_id: number) {}
}
