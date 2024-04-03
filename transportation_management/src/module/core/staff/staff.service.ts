import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderStatusUpdateDto } from './dto/order-status.update.dto';
import { OrderEntity } from '../../../entities/order.entity';

@Injectable()
export class StaffService {
    constructor(
        @InjectRepository(OrderEntity)
        private orderRepository: Repository<OrderEntity>,
    ) {}

    /**
     * update order status.
     *
     * @param request OrderStatusUpdateDto
     */
    async updateOrderStatus(request: OrderStatusUpdateDto): Promise<boolean> {
        try {
            const order = await this.orderRepository.findOne({ where: { orderId: request.orderId } });
            order.orderStt = request.orderStatus;
            await this.orderRepository.update(request.orderId, order);

            return true;
        } catch (error) {
            Logger.log(error);
            throw new InternalServerErrorException();
        }
    }

    async updateCustomerStatus(data: any): Promise<any> {
        return data;
    }
}
