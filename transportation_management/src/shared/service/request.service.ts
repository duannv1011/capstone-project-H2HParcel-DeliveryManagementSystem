import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestEntity } from '../../entities/request.entity';
import { RequestCreateDto } from '../dto/request/request.create.dto';
import { RequestUpdateDto } from '../dto/request/request.update.dto';

@Injectable()
export class RequestService {
    constructor(
        @InjectRepository(RequestEntity)
        private requestRepository: Repository<RequestEntity>,
    ) {}

    /**
     * Find all request by order.
     *
     * @param orderId number
     */
    async findAllRequest(orderId: number): Promise<RequestEntity[]> {
        try {
            return await this.requestRepository.find({ where: { orderId: orderId } });
        } catch (error) {
            Logger.log(error);
            throw new InternalServerErrorException();
        }
    }

    /**
     * Find request detail.
     *
     * @param requestId number
     */
    async findRequestDetail(requestId: number): Promise<RequestEntity> {
        try {
            return await this.requestRepository.findOne({ where: { requestId: requestId } });
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
    async createRequest(request: RequestCreateDto): Promise<RequestEntity> {
        try {
            const requestNew = this.requestRepository.create(request);
            const result = await requestNew.save();

            return await this.requestRepository.findOne({ where: { requestId: result.requestId } });
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
            await this.requestRepository.update(request.requestId, request);

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
        try {
            const requestCancel = await this.requestRepository.findOne({ where: { requestId: requestId } });
            if (requestCancel) {
                // TODO: QA request status
                requestCancel.requestStatus = 5;
                await this.requestRepository.update(requestId, requestCancel);

                return true;
            }

            return false;
        } catch (error) {
            Logger.log(error);
            throw new InternalServerErrorException();
        }
    }
}
