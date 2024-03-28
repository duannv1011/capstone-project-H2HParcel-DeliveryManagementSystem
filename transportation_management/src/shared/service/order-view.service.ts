import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from '../../entities/order.entity';
import { StaffEntity } from '../../entities/staff.entity';

@Injectable()
export class OrderViewService {
    constructor(
        @InjectRepository(OrderEntity)
        private orderRepository: Repository<OrderEntity>,
    ) {}

    /**
     * Find all pickup order of staff.
     *
     * @param staffId number
     */
    async findAllPickupOrderByStaff(staffId: number): Promise<OrderEntity[]> {
        return await this.orderRepository
            .createQueryBuilder('order')
            .innerJoinAndSelect(StaffEntity, 'staff', 'order.pickup_transporter = staff.staff_id')
            .where('order.pickupTransporter = :staffId', { staffId: staffId })
            .getMany();
    }

    /**
     * Find all deliver order of staff.
     *
     * @param staffId number
     */
    async findAllDeliverOrderByStaff(staffId: number): Promise<OrderEntity[]> {
        return await this.orderRepository
            .createQueryBuilder('order')
            .innerJoinAndSelect(StaffEntity, 'staff', 'order.deliver_transporter = staff.staff_id')
            .where('order.deliverTransporter = :staffId', { staffId: staffId })
            .getMany();
    }

    /**
     * Find one order by id.
     *
     * @param orderId number
     */
    async findOneOrder(orderId: number): Promise<OrderEntity> {
        return await this.orderRepository.findOne({ where: { order_id: orderId } });
    }
}
