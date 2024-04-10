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
    private orderDirection: string = 'ASC';
    private setOrderDirection(orderby: string) {
        this.orderDirection = orderby;
    }
    private getOrderDirection() {
        return this.orderDirection;
    }
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
            .leftJoinAndSelect('order.pickupInformation', 'pickupInformation')
            .leftJoinAndSelect('order.deliverInformation', 'deliverInformation')
            .leftJoinAndSelect('order.pickupShipperStaff', 'pickupShipperStaff')
            .leftJoinAndSelect('order.deliverShipperStaff', 'deliverShipperStaff')
            .leftJoinAndSelect('order.packageType', 'packageType')
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
        const warehouseId = (await this.getStaff(userLogin)).warehouseId;

        if (status > 0 && status < OrderStatus.ON_TRANSIT) {
            const [orders, total] = await this.orderRepository
                .createQueryBuilder('order')
                .innerJoinAndSelect('order.status', 'orderStatus')
                .leftJoinAndSelect('order.pickupInformation', 'pickupInformation')
                .leftJoinAndSelect('order.pickupShipperStaff', 'pickupShipperStaff')
                .leftJoinAndSelect('order.packageType', 'packageType')
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
                .leftJoinAndSelect('order.deliverInformation', 'deliverInformation')
                .leftJoinAndSelect('order.deliverShipperStaff', 'deliverShipperStaff')
                .leftJoinAndSelect('order.packageType', 'packageType')
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
        const warehouseId = (await this.getStaff(userLogin)).warehouseId;

        if (warehouseId) {
            const [orders, total] = await this.orderRepository
                .createQueryBuilder('order')
                .innerJoinAndSelect('order.status', 'orderStatus')
                .leftJoinAndSelect('order.pickupInformation', 'pickupInformation')
                .leftJoinAndSelect('order.deliverInformation', 'deliverInformation')
                .leftJoinAndSelect('order.pickupShipperStaff', 'pickupShipperStaff')
                .leftJoinAndSelect('order.deliverShipperStaff', 'deliverShipperStaff')
                .leftJoinAndSelect('order.packageType', 'packageType')
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
                        qb.where('pickupWard.warehouse_id = :warehouseId', {
                            warehouseId: warehouseId,
                        }).orWhere('deliverWard.warehouse_id = :warehouseId', { warehouseId: warehouseId });
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
    async findAllByWarehouseFilters(
        pageNo: number,
        userLogin: UserLoginData,
        searchValue: string,
        orderStatus: number,
    ): Promise<OrderResponse> {
        try {
            orderStatus = orderStatus <= 10 && orderStatus >= 1 ? orderStatus : 0;
            searchValue = searchValue ? searchValue : '';
            const warehouseId = (await this.getStaff(userLogin)).warehouseId;
            if (warehouseId) {
                const queryBuilder = await this.orderRepository
                    .createQueryBuilder('order')
                    .innerJoinAndSelect('order.status', 'orderStatus')
                    .leftJoinAndSelect('order.customer', 'customer')
                    .leftJoinAndSelect('order.pickupInformation', 'pickupInformation')
                    .leftJoinAndSelect('order.deliverInformation', 'deliverInformation')
                    .leftJoinAndSelect('order.pickupShipperStaff', 'pickupShipperStaff')
                    .leftJoinAndSelect('order.deliverShipperStaff', 'deliverShipperStaff')
                    .leftJoinAndSelect('order.packageType', 'packageType')
                    .leftJoinAndSelect('pickupInformation.address', 'pickupAddress')
                    .leftJoinAndSelect('pickupAddress.city', 'pickupCity')
                    .leftJoinAndSelect('pickupAddress.district', 'pickupDistrict')
                    .leftJoinAndSelect('pickupAddress.ward', 'pickupWard')
                    .leftJoinAndSelect('deliverInformation.address', 'deliverAddress')
                    .leftJoinAndSelect('deliverAddress.city', 'deliverCity')
                    .leftJoinAndSelect('deliverAddress.district', 'deliverDistrict')
                    .leftJoinAndSelect('deliverAddress.ward', 'deliverWard')
                    .where(
                        new Brackets((qb) => {
                            qb.where('pickupWard.warehouse_id = :warehouseId', {
                                warehouseId: warehouseId,
                            }).orWhere('deliverWard.warehouse_id = :warehouseId', { warehouseId: warehouseId });
                        }),
                    )
                    .andWhere(
                        new Brackets((qb) => {
                            qb.where('pickupShipperStaff.fullname LIKE :pfullname', { pfullname: `%${searchValue}%` })
                                .orWhere('deliverShipperStaff.fullname LIKE :dfullname', {
                                    dfullname: `%${searchValue}%`,
                                })
                                .orWhere('pickupInformation.name LIKE :pifullname', { pifullname: `%${searchValue}%` })
                                .orWhere('pickupInformation.phone LIKE :piphone', { piphone: `%${searchValue}%` })
                                .orWhere('deliverInformation.name LIKE :pifullname', { pifullname: `%${searchValue}%` })
                                .orWhere('deliverInformation.phone LIKE :piphone', { piphone: `%${searchValue}%` });
                        }),
                    )
                    .skip((pageNo - 1) * this.pageSize)
                    .take(this.pageSize);
                if (orderStatus !== 0) {
                    queryBuilder.andWhere('order.order_stt = :orderStatus', { orderStatus: orderStatus });
                }
                if (this.getOrderDirection() === 'ASC') {
                    queryBuilder.orderBy('order.date_create_at', 'ASC');
                    this.setOrderDirection('DESC');
                } else {
                    queryBuilder.orderBy('order.date_create_at', 'DESC');
                    this.setOrderDirection('ASC');
                }
                const [orders, total] = await queryBuilder.getManyAndCount();
                console.log(total);
                const orderList = [];
                orders.forEach((element) => {
                    orderList.push(this.toOrder(element));
                });

                const paging: Paging = new Paging(pageNo, this.pageSize, total);

                return { orders: orderList, paging: paging };
            }

            return { orders: [], paging: null };
        } catch (error) {
            console.error('Error in findAllByWarehouseFilters:', error);
            throw new Error('An error occurred while fetching orders.');
        }
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
            const warehouseId = (await this.getStaff(userLogin)).warehouseId;

            if (warehouseId) {
                const [orders, total] = await this.orderRepository
                    .createQueryBuilder('order')
                    .innerJoinAndSelect('order.status', 'orderStatus')
                    .leftJoinAndSelect('order.pickupInformation', 'pickupInformation')
                    .leftJoinAndSelect('order.deliverInformation', 'deliverInformation')
                    .leftJoinAndSelect('order.pickupShipperStaff', 'pickupShipperStaff')
                    .leftJoinAndSelect('order.deliverShipperStaff', 'deliverShipperStaff')
                    .leftJoinAndSelect('order.packageType', 'packageType')
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
        const pickupUser = entity.pickupInformation;
        const deliverUser = entity.deliverInformation;
        const pickupStaff = entity.pickupShipperStaff;
        const deliverStaff = entity.deliverShipperStaff;
        const packageType = entity.packageType;

        if (entity) {
            return Builder<Order>()
                .orderId(entity.orderId)
                .statusId(entity.status.sttId)
                .status(entity.status.sttName)
                .senderName(pickupUser ? pickupUser.name : '')
                .pickupPhoneNumber(pickupUser ? pickupUser.phone : '')
                .pickupAddress(
                    pickupUser
                        ? `${pickupUser.address.house}-${pickupUser.address.ward.wardName}-${pickupUser.address.district.districtName} - ${pickupUser.address.city.cityName}`
                        : '',
                )
                .pickupStaffName(pickupStaff ? pickupStaff.fullname : '')
                .packageTypeId(packageType ? packageType.pkId : null)
                .packageTypeName(packageType ? packageType.pkName : '')
                .receiverName(deliverUser ? deliverUser.name : '')
                .deliverPhoneNumber(deliverUser ? deliverUser.phone : '')
                .deliverAddress(
                    deliverUser
                        ? `${deliverUser.address.house}-${deliverUser.address.ward.wardName}-${deliverUser.address.district.districtName} - ${deliverUser.address.city.cityName}`
                        : '',
                )
                .deliverStaffName(deliverStaff ? deliverStaff.fullname : '')
                .pickUpdateWarehouseId(entity.pickupInformation.address.ward.warehouseId)
                .deliverUpdateWarehouseId(entity.deliverInformation.address.ward.warehouseId)
                .price(entity.estimatedPrice)
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
            const pickupUser = entity.pickupInformation;
            const pickupStaff = entity.pickupShipperStaff;

            return Builder<Order>()
                .orderId(entity.orderId)
                .status(entity.status.sttName)
                .senderName(pickupUser ? pickupUser.name : '')
                .pickupPhoneNumber(pickupUser ? pickupUser.phone : '')
                .pickupAddress(
                    pickupUser
                        ? `${pickupUser.address.district.districtName} - ${pickupUser.address.city.cityName}`
                        : '',
                )
                .pickupStaffName(pickupStaff ? pickupStaff.fullname : '')
                .price(entity.estimatedPrice)
                .pickUpdateWarehouseId(entity.pickupInformation.address.ward.warehouseId)
                .deliverUpdateWarehouseId(entity.deliverInformation.address.ward.warehouseId)
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
            const deliverUser = entity.deliverInformation;
            const deliverStaff = entity.deliverShipperStaff;

            return Builder<Order>()
                .orderId(entity.orderId)
                .status(entity.status.sttName)
                .receiverName(deliverUser ? deliverUser.name : '')
                .deliverPhoneNumber(deliverUser ? deliverUser.phone : '')
                .deliverAddress(
                    deliverUser
                        ? `${deliverUser.address.district.districtName} - ${deliverUser.address.city.cityName}`
                        : '',
                )
                .deliverStaffName(deliverStaff ? deliverStaff.fullname : '')
                .price(entity.estimatedPrice)
                .pickUpdateWarehouseId(entity.pickupInformation.address.ward.warehouseId)
                .deliverUpdateWarehouseId(entity.deliverInformation.address.ward.warehouseId) //
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
        const staff = await this.staffRepository.findOne({ where: { accId: userLogin.accId } });

        if (staff) {
            return staff;
        }

        return null;
    }
}
