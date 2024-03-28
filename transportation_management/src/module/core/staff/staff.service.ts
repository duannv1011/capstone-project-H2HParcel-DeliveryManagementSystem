import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssignCodeDto } from './dto/assign-code.dto';
import { OrderStatusUpdateDto } from './dto/order-status.update.dto';
import { OrderEntity } from '../../../entities/order.entity';
import { QRCodeEntity } from '../../../entities/qrcode.entity';

@Injectable()
export class StaffService {
    constructor(
        @InjectRepository(QRCodeEntity)
        private codeRepository: Repository<QRCodeEntity>,
        @InjectRepository(OrderEntity)
        private orderRepository: Repository<OrderEntity>,
    ) {}

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
                order.order_id = request.orderId;
                //code.order = order;
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
     * update order status.
     *
     * @param request OrderStatusUpdateDto
     */
    async updateOrderStatus(request: OrderStatusUpdateDto): Promise<boolean> {
        try {
            const order = await this.orderRepository.findOne({ where: { order_id: request.orderId } });
            order.order_stt = request.orderStatus;
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
