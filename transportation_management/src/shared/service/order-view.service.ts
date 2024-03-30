import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { OrderEntity } from '../../entities/order.entity';
import { StaffEntity } from '../../entities/staff.entity';
import { Order, OrderDetailResponse, OrderResponse } from '../../module/core/staff/response/order.response';
import { UserLoginData } from '../../module/core/authentication/dto/user_login_data';
import { Paging } from '../../module/response/Paging';
import { OrderStatus } from '../../enum/order-status.enum';
import { Builder } from 'builder-pattern';

@Injectable()
export class OrderViewService {
    constructor(
        @InjectRepository(OrderEntity)
        private orderRepository: Repository<OrderEntity>,
        @InjectRepository(StaffEntity)
        private staffRepository: Repository<StaffEntity>,
    ) {}

    pageSize = Number(process.env.PAGE_SIZE);

    /**
     * Find one order by id.
     *
     * @param orderId number
     */
    async findOneOrder(orderId: number): Promise<OrderDetailResponse> {
        const order = await this.orderRepository
            .createQueryBuilder('order')
            .innerJoinAndSelect('order.status', 'orderStatus')
            .leftJoinAndSelect('order.pickup_information', 'pickupInformation')
            .leftJoinAndSelect('order.deliver_information', 'deliverInformation')
            .leftJoinAndSelect('order.pickup_shipper_staff', 'pickupShipperStaff')
            .leftJoinAndSelect('order.deliver_shipper_staff', 'deliverShipperStaff')
            .leftJoinAndSelect('order.package_type', 'packageType')
            .leftJoinAndSelect('pickupInformation.address', 'pickupAddress')
            .leftJoinAndSelect('pickupAddress.city', 'pickupCity')
            .leftJoinAndSelect('pickupAddress.district', 'pickupDistrict')
            .leftJoinAndSelect('pickupAddress.ward', 'pickupWard')
            .leftJoinAndSelect('deliverInformation.address', 'deliverAddress')
            .leftJoinAndSelect('deliverAddress.city', 'deliverCity')
            .leftJoinAndSelect('deliverAddress.district', 'deliverDistrict')
            .leftJoinAndSelect('deliverAddress.ward', 'deliverWard')
            .where('order.order_id = :orderId', { orderId: orderId })
            .getOne();

        return { order: this.toOrder(order) };
    }

    /**
     * Find orders by status.
     *
     * @param pageNo
     * @param status
     * @param userLogin
     */
    async findOrderByStatus(pageNo: number, status: number, userLogin: UserLoginData): Promise<OrderResponse> {
        const warehouseId = (await this.getStaff(userLogin)).warehouse_id;

        if (status > 0 && status < OrderStatus.ON_TRANSIT) {
            const [orders, total] = await this.orderRepository
                .createQueryBuilder('order')
                .innerJoinAndSelect('order.status', 'orderStatus')
                .leftJoinAndSelect('order.pickup_information', 'pickupInformation')
                .leftJoinAndSelect('order.pickup_shipper_staff', 'pickupShipperStaff')
                .leftJoinAndSelect('order.package_type', 'packageType')
                .leftJoinAndSelect('pickupInformation.address', 'pickupAddress')
                .leftJoinAndSelect('pickupAddress.city', 'pickupCity')
                .leftJoinAndSelect('pickupAddress.district', 'pickupDistrict')
                .leftJoinAndSelect('pickupAddress.ward', 'pickupWard')
                .where('pickupShipperStaff.warehouse_id = :warehouseId', { warehouseId: warehouseId })
                .andWhere('orderStatus.stt_id = :status', { status: status })
                .orderBy('order.date_create_at', 'DESC')
                .skip((pageNo - 1) * this.pageSize)
                .take(this.pageSize)
                .getManyAndCount();

            const orderList = [];
            orders.forEach((element) => {
                orderList.push(this.toPickupOrder(element));
            });

            const paging: Paging = new Paging(pageNo, this.pageSize, total);

            return { orders: orderList, paging: paging };
        } else if (status > OrderStatus.ON_TRANSIT) {
            const [orders, total] = await this.orderRepository
                .createQueryBuilder('order')
                .innerJoinAndSelect('order.status', 'orderStatus')
                .leftJoinAndSelect('order.deliver_information', 'deliverInformation')
                .leftJoinAndSelect('order.deliver_shipper_staff', 'deliverShipperStaff')
                .leftJoinAndSelect('order.package_type', 'packageType')
                .leftJoinAndSelect('deliverInformation.address', 'deliverAddress')
                .leftJoinAndSelect('deliverAddress.city', 'deliverCity')
                .leftJoinAndSelect('deliverAddress.district', 'deliverDistrict')
                .leftJoinAndSelect('deliverAddress.ward', 'deliverWard')
                .where('deliverShipperStaff.warehouse_id = :warehouseId', { warehouseId: warehouseId })
                .andWhere('orderStatus.stt_id = :status', { status: status })
                .orderBy('order.date_create_at', 'DESC')
                .skip((pageNo - 1) * this.pageSize)
                .take(this.pageSize)
                .getManyAndCount();

            const orderList = [];
            orders.forEach((element) => {
                orderList.push(this.toDeliverOrder(element));
            });

            const paging: Paging = new Paging(pageNo, this.pageSize, total);

            return { orders: orderList, paging: paging };
        }

        return { orders: [], paging: null };
    }

    /**
     * Find all staff.
     *
     * @param pageNo
     * @param userLogin
     */
    async findAllByStaff(pageNo: number, userLogin: UserLoginData): Promise<OrderResponse> {
        const warehouseId = (await this.getStaff(userLogin)).warehouse_id;

        if (warehouseId) {
            const [orders, total] = await this.orderRepository
                .createQueryBuilder('order')
                .innerJoinAndSelect('order.status', 'orderStatus')
                .leftJoinAndSelect('order.pickup_information', 'pickupInformation')
                .leftJoinAndSelect('order.deliver_information', 'deliverInformation')
                .leftJoinAndSelect('order.pickup_shipper_staff', 'pickupShipperStaff')
                .leftJoinAndSelect('order.deliver_shipper_staff', 'deliverShipperStaff')
                .leftJoinAndSelect('order.package_type', 'packageType')
                .leftJoinAndSelect('pickupInformation.address', 'pickupAddress')
                .leftJoinAndSelect('pickupAddress.city', 'pickupCity')
                .leftJoinAndSelect('pickupAddress.district', 'pickupDistrict')
                .leftJoinAndSelect('pickupAddress.ward', 'pickupWard')
                .leftJoinAndSelect('deliverInformation.address', 'deliverAddress')
                .leftJoinAndSelect('deliverAddress.city', 'deliverCity')
                .leftJoinAndSelect('deliverAddress.district', 'deliverDistrict')
                .leftJoinAndSelect('deliverAddress.ward', 'deliverWard')
                .andWhere(
                    new Brackets((qb) => {
                        qb.where('pickupShipperStaff.warehouse_id = :warehouseId', {
                            warehouseId: warehouseId,
                        }).orWhere('deliverShipperStaff.warehouse_id = :warehouseId', { warehouseId: warehouseId });
                    }),
                )
                .orderBy('order.date_create_at', 'DESC')
                .skip((pageNo - 1) * this.pageSize)
                .take(this.pageSize)
                .getManyAndCount();

            const orderList = [];
            orders.forEach((element) => {
                orderList.push(this.toOrder(element));
            });

            const paging: Paging = new Paging(pageNo, this.pageSize, total);

            return { orders: orderList, paging: paging };
        }

        return { orders: [], paging: null };
    }

    /**
     * Find orders by range time.
     *
     * @param pageNo
     * @param from
     * @param to
     * @param userLogin
     */
    async findOrderByTime(pageNo: number, from: string, to: string, userLogin: UserLoginData): Promise<OrderResponse> {
        try {
            const warehouseId = (await this.getStaff(userLogin)).warehouse_id;

            if (warehouseId) {
                const [orders, total] = await this.orderRepository
                    .createQueryBuilder('order')
                    .innerJoinAndSelect('order.status', 'orderStatus')
                    .leftJoinAndSelect('order.pickup_information', 'pickupInformation')
                    .leftJoinAndSelect('order.deliver_information', 'deliverInformation')
                    .leftJoinAndSelect('order.pickup_shipper_staff', 'pickupShipperStaff')
                    .leftJoinAndSelect('order.deliver_shipper_staff', 'deliverShipperStaff')
                    .leftJoinAndSelect('order.package_type', 'packageType')
                    .leftJoinAndSelect('pickupInformation.address', 'pickupAddress')
                    .leftJoinAndSelect('pickupAddress.city', 'pickupCity')
                    .leftJoinAndSelect('pickupAddress.district', 'pickupDistrict')
                    .leftJoinAndSelect('pickupAddress.ward', 'pickupWard')
                    .leftJoinAndSelect('deliverInformation.address', 'deliverAddress')
                    .leftJoinAndSelect('deliverAddress.city', 'deliverCity')
                    .leftJoinAndSelect('deliverAddress.district', 'deliverDistrict')
                    .leftJoinAndSelect('deliverAddress.ward', 'deliverWard')
                    .andWhere(
                        new Brackets((qb) => {
                            qb.where('pickupShipperStaff.warehouse_id = :warehouseId', {
                                warehouseId: warehouseId,
                            }).orWhere('deliverShipperStaff.warehouse_id = :warehouseId', { warehouseId: warehouseId });
                        }),
                    )
                    .andWhere('order.date_create_at between :from and :to', { from: from, to: to })
                    .orderBy('order.date_create_at', 'DESC')
                    .skip((pageNo - 1) * this.pageSize)
                    .take(this.pageSize)
                    .getManyAndCount();

                const orderList = [];
                orders.forEach((element) => {
                    orderList.push(this.toOrder(element));
                });

                const paging: Paging = new Paging(pageNo, this.pageSize, total);

                return { orders: orderList, paging: paging };
            }

            return { orders: [], paging: null };
        } catch (error) {
            Logger.error(error);
            throw new InternalServerErrorException();
        }
    }

    /**
     * Transform response.
     *
     * @param entity OrderEntity
     */
    private toOrder(entity?: OrderEntity): Order {
        const pickupUser = entity.pickup_information;
        const deliverUser = entity.deliver_information;
        const pickupStaff = entity.pickup_shipper_staff;
        const deliverStaff = entity.deliver_shipper_staff;

        if (entity) {
            return Builder<Order>()
                .orderId(entity.order_id)
                .status(entity.status.stt_name)
                .senderName(pickupUser ? pickupUser.name : '')
                .pickupPhoneNumber(pickupUser ? pickupUser.phone : '')
                .pickupAddress(
                    pickupUser
                        ? `${pickupUser.address.district.district_name} - ${pickupUser.address.city.city_name}`
                        : '',
                )
                .pickupStaffName(pickupStaff ? pickupStaff.fullname : '')
                .receiverName(deliverUser ? deliverUser.name : '')
                .deliverPhoneNumber(deliverUser ? deliverUser.phone : '')
                .deliverAddress(
                    deliverUser
                        ? `${deliverUser.address.district.district_name} - ${deliverUser.address.city.city_name}`
                        : '',
                )
                .deliverStaffName(deliverStaff ? deliverStaff.fullname : '')
                .price(entity.estimated_price)
                .build();
        }

        return Builder<Order>().build();
    }

    /**
     * Transform response pickup.
     *
     * @param entity OrderEntity
     */
    private toPickupOrder(entity?: OrderEntity): Order {
        if (entity) {
            const pickupUser = entity.pickup_information;
            const pickupStaff = entity.pickup_shipper_staff;

            return Builder<Order>()
                .orderId(entity.order_id)
                .status(entity.status.stt_name)
                .senderName(pickupUser ? pickupUser.name : '')
                .pickupPhoneNumber(pickupUser ? pickupUser.phone : '')
                .pickupAddress(
                    pickupUser
                        ? `${pickupUser.address.district.district_name} - ${pickupUser.address.city.city_name}`
                        : '',
                )
                .pickupStaffName(pickupStaff ? pickupStaff.fullname : '')
                .price(entity.estimated_price)
                .build();
        }

        return Builder<Order>().build();
    }

    /**
     * Transform response deliver.
     *
     * @param entity OrderEntity
     */
    private toDeliverOrder(entity?: OrderEntity): Order {
        if (entity) {
            const deliverUser = entity.deliver_information;
            const deliverStaff = entity.deliver_shipper_staff;

            return Builder<Order>()
                .orderId(entity.order_id)
                .status(entity.status.stt_name)
                .receiverName(deliverUser ? deliverUser.name : '')
                .deliverPhoneNumber(deliverUser ? deliverUser.phone : '')
                .deliverAddress(
                    deliverUser
                        ? `${deliverUser.address.district.district_name} - ${deliverUser.address.city.city_name}`
                        : '',
                )
                .deliverStaffName(deliverStaff ? deliverStaff.fullname : '')
                .price(entity.estimated_price)
                .build();
        }

        return Builder<Order>().build();
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
