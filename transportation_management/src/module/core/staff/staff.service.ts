import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CodeEntity } from '../../../entities/code.entity';
import { AssignCodeCreateDto } from './dto/assign-code.create.dto';
import { OrderStatusUpdateDto } from './dto/order-status.update.dto';
import { OrderEntity } from '../../../entities/order.entity';

@Injectable()
export class StaffService {
    constructor(
        @InjectRepository(CodeEntity)
        private codeRepository: Repository<CodeEntity>,
        @InjectRepository(OrderEntity)
        private orderRepository: Repository<OrderEntity>,
    ) {}

    /**
     * assign Code To Order.
     *
     * @param request AssignCodeCreateDto
     */
    async assignCodeToOrder(request: AssignCodeCreateDto): Promise<boolean> {
        try {
            const code = this.codeRepository.create(request);
            const order: OrderEntity = new OrderEntity();
            order.orderId = request.orderId;
            code.order = order;
            await code.save();

            return true;
        } catch (error) {
            Logger.log(error);
            throw new InternalServerErrorException();
        }
    }

    /**
     * update order status.
     *
     * @param request OrderStatusUpdateDto
     */
    async updateOrderStatus(request: OrderStatusUpdateDto): Promise<boolean> {
        try {
            const order = await this.orderRepository.findOne({ where: { orderId: request.orderId } });
            order.orderStatus = request.orderStatus;
            await this.orderRepository.update(request.orderId, order);

            return true;
        } catch (error) {
            Logger.log(error);
            throw new InternalServerErrorException();
        }
    }
}
