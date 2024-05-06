import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderStatusEntity } from 'src/entities/order-status.entity';
import { PackageTypeEntity } from 'src/entities/package-type.entity';
import { RequestStatusEntity } from 'src/entities/request-status.entity';
import { RequestTypeEntity } from 'src/entities/request-type.entity';
import { Repository } from 'typeorm';
@Injectable()
export class StatusService {
    constructor(
        @InjectRepository(OrderStatusEntity)
        private orderStatusRepository: Repository<OrderStatusEntity>,
        @InjectRepository(RequestStatusEntity)
        private requestStatusRepository: Repository<RequestStatusEntity>,
        @InjectRepository(RequestTypeEntity)
        private requestTypeRepository: Repository<RequestTypeEntity>,
        @InjectRepository(PackageTypeEntity)
        private packageTypeRepository: Repository<PackageTypeEntity>,
    ) {}

    async getAllCustomerStatus(): Promise<any> {
        const statusData = [
            { stt_id: 1, statusName: 'Acitve' },
            { stt_id: 2, statusName: 'Suspended' },
            { stt_id: 3, statusName: 'Inactive' },
        ];
        return statusData;
    }
    async getAllStaffStatus() {
        const statusData = [
            { stt_id: 1, statusName: 'Acitve' },
            { stt_id: 2, statusName: 'Suspended' },
            { stt_id: 3, statusName: 'Inactive' },
        ];
        return statusData;
    }
    async getAllOrderStatus(): Promise<any> {
        return this.orderStatusRepository.find();
    }
    async getAllRequestStatus(): Promise<any> {
        return this.requestStatusRepository.find();
    }
    async getAllRequestType(): Promise<any> {
        return this.requestTypeRepository.find();
    }
    async getAllPackageType(): Promise<any> {
        return this.packageTypeRepository.find();
    }
}
