import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Builder } from 'builder-pattern';
import {
    ReportOrderDetail,
    ReportOrderDetailResponse,
    RevenueByWarehouse,
    revanueByMonth,
} from './response/report.response';
import { UserLoginData } from '../../core/authentication/dto/user_login_data';
import { StaffEntity } from '../../../entities/staff.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { WarehouseEntity } from '../../../entities/warehouse.entity';
import * as moment from 'moment-timezone';
import { OrderEntity } from '../../../entities/order.entity';
import { DistrictEntity } from '../../../entities/district.entity';
import { AddressEntity } from '../../../entities/address.entity';
import { Paging } from '../../response/Paging';
import { WardEntity } from '../../../entities/ward.entity';
import * as _ from 'lodash';
import { OrderStatus } from '../../../enum/order-status.enum';
import { ReportWarehouse, ReportWarehouseResponse, Warehouse } from './response/report-warehouse.reponse';
import { District, ReportDistrict, ReportDistrictResponse } from './response/report-district.reponse';
import { InformationEntity } from '../../../entities/information.entity';
@Injectable()
export class ReportService {
    constructor(
        @InjectRepository(StaffEntity)
        private staffRepository: Repository<StaffEntity>,
        @InjectRepository(WarehouseEntity)
        private warehouseRepository: Repository<WarehouseEntity>,
        @InjectRepository(DistrictEntity)
        private districtRepository: Repository<DistrictEntity>,
        @InjectRepository(OrderEntity)
        private orderRepository: Repository<OrderEntity>,
    ) {}

    pageSize = Number(process.env.PAGE_SIZE);
    async reportRevenueAdminforGraph() {
        const currentYear = new Date().getFullYear(); // Get the current year
        const dataquery = await this.orderRepository
            .createQueryBuilder('o')
            .select('EXTRACT(MONTH FROM o.date_update_at) AS month')
            .addSelect('SUM(o.estimated_price) AS totalRevenue')
            .where('o.order_stt = :stt', { stt: 9 })
            .andWhere('EXTRACT(YEAR FROM o.date_update_at) = :year', { year: currentYear.toString() })
            .groupBy('EXTRACT(MONTH FROM o.date_update_at)')
            .getRawMany();
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const revenueByMonth: revanueByMonth[] = Array.from({ length: currentMonth }, (_, i) => ({
            month: i + 1,
            totalRevenue: '0',
        }));
        dataquery.forEach((data) => {
            revenueByMonth[Number(data.month) - 1].totalRevenue = data.totalrevenue;
        });
        return revenueByMonth;
    }
    async reportAdminRevenueByWarehoueInMotnhfortable(month: number) {
        const currentYear = new Date().getFullYear(); // Get the current year
        const dataQuery = await this.orderRepository
            .createQueryBuilder('o')
            .leftJoinAndSelect('o.pickupInformation', 'pi')
            .leftJoinAndSelect('o.deliverInformation', 'di')
            .leftJoinAndSelect('pi.address', 'pia')
            .leftJoinAndSelect('di.address', 'dia')
            .leftJoinAndSelect('pia.ward', 'piw')
            .leftJoinAndSelect('dia.ward', 'diw')
            .leftJoinAndSelect(WarehouseEntity, 'piww', 'piw.warehouse_id = piww.warehouse_id')
            .leftJoinAndSelect(WarehouseEntity, 'diww', 'diw.warehouse_id = diww.warehouse_id')
            .select([
                'o.date_update_at',
                'EXTRACT(MONTH FROM o.date_update_at) AS curuntMonth',
                'o.order_id',
                'piw.warehouse_id AS pickupWarehouse',
                'piww.warehouse_name AS pickupWarehouseName',
                '(o.estimated_price * 0.4) AS pickupWarehouseRevanue',
                'diw.warehouse_id AS deliverWarehouse',
                'diww.warehouse_name AS deliverWarehouseName',
                '(o.estimated_price * 0.6) AS deliverWarehouseRevanue',
            ])
            .where('o.order_stt = :stt', { stt: 9 })
            .andWhere('EXTRACT(MONTH FROM o.date_update_at) = :month', { month: month.toString() })
            .andWhere('EXTRACT(YEAR FROM o.date_update_at) = :year', { year: currentYear.toString() })
            .getRawMany();
        const data: RevenueByWarehouse[] = [];

        dataQuery.forEach((item) => {
            const pickupData: RevenueByWarehouse = {
                date: item.o_date_update_at,
                currentMonth: item.curuntmonth,
                warehouseId: item.pickupwarehouse,
                warehouseName: item.pickupwarehousename,
                revenue: Number(item.pickupwarehouserevanue),
            };

            const deliverData: RevenueByWarehouse = {
                date: item.o_date_update_at,
                currentMonth: item.curuntmonth,
                warehouseId: item.deliverwarehouse,
                warehouseName: item.deliverwarehousename,
                revenue: Number(item.deliverwarehouserevanue),
            };
            data.push(pickupData, deliverData);
        });
        const warehouseMap = _.groupBy(data, 'warehouseId');
        const result = [];
        for (const [key, value] of Object.entries(warehouseMap)) {
            result.push({
                warehouseId: Number(key),
                warehouseName: value[0].warehouseName,
                revenue: _.sumBy(value, 'revenue'),
            });
        }
        const warehouses = await this.warehouseRepository
            .createQueryBuilder('w')
            .select(['w.warehouseId', 'w.warehouseName', '0 AS revenue'])
            .getRawMany();

        const mergedWarehouses = warehouses.map((warehouse) => {
            const found = result.find(({ warehouseId }) => warehouseId === warehouse.w_warehouse_id);
            return {
                warehouseId: warehouse.w_warehouse_id,
                warehouseName: warehouse.w_warehouse_name,
                revenue: found ? found.revenue : 0,
            };
        });
        const sortedWarehouses = mergedWarehouses.sort((a, b) => b.revenue - a.revenue);

        return sortedWarehouses;
    }
    async getReportManagerOrderDetail(userLogin: UserLoginData, pageNo: number): Promise<ReportOrderDetailResponse> {
        try {
            const warehouseIdList = await this.getWarehouseIdByStaff(userLogin);

            const warehouses = await this.getReportOrderQuery(pageNo, warehouseIdList);
            const pickupWarehouse = [];
            const deliverWarehouse = [];

            for (const element of warehouses.pickupWarehouse) {
                element.month = moment(element.pickupOrder_date_update_at).month() + 1;
                pickupWarehouse.push(element);
            }
            for (const element of warehouses.deliverWarehouse) {
                element.month = moment(element.deliverOrder_date_update_at).month() + 1;
                deliverWarehouse.push(element);
            }
            const orderList = [...pickupWarehouse, ...deliverWarehouse];
            const orderMap = _.groupBy(orderList, 'warehouse_warehouse_name');
            const orderMonthMap = _.groupBy(orderList, 'month');

            const orderByWarehouseList = [];
            const orderByWarehouseListChart = [];

            for (const [key, value] of Object.entries(orderMap)) {
                const pickupTotal = _.filter(value, function (o) {
                    if (o.pickup_pickup_shipper !== null) return o;
                }).length;
                const deliverTotal = _.filter(value, function (o) {
                    if (o.deliver_deliver_shipper !== null) return o;
                }).length;
                orderByWarehouseList.push({
                    warehouseName: key,
                    pickupOrder: pickupTotal,
                    deliverOrder: deliverTotal,
                });
            }

            for (const [key, value] of Object.entries(orderMonthMap)) {
                const pickupTotal = _.filter(value, function (o) {
                    if (o.pickup_pickup_shipper !== null) return o;
                }).length;
                const deliverTotal = _.filter(value, function (o) {
                    if (o.deliver_deliver_shipper !== null) return o;
                }).length;

                orderByWarehouseListChart.push({
                    month: Number(key),
                    pickupOrder: pickupTotal,
                    deliverOrder: deliverTotal,
                });
            }
            const paging: Paging = new Paging(pageNo, this.pageSize, orderByWarehouseList.length);

            const report = Builder<ReportOrderDetail>()
                .reportChart(orderByWarehouseListChart)
                .warehouses(orderByWarehouseList)
                .build();

            return {
                report: report,
                paging: paging,
            };
        } catch (error) {
            Logger.error(error);
            throw new InternalServerErrorException();
        }
    }

    async getReportAdminOrderDetail(pageNo: number): Promise<ReportOrderDetailResponse> {
        try {
            const warehouses = await this.getReportOrderQuery(pageNo);
            const pickupWarehouse = [];
            const deliverWarehouse = [];

            for (const element of warehouses.pickupWarehouse) {
                element.month = moment(element.pickupOrder_date_update_at).month() + 1;
                pickupWarehouse.push(element);
            }
            for (const element of warehouses.deliverWarehouse) {
                element.month = moment(element.deliverOrder_date_update_at).month() + 1;
                deliverWarehouse.push(element);
            }
            const orderList = [...pickupWarehouse, ...deliverWarehouse];
            const orderMap = _.groupBy(orderList, 'warehouse_warehouse_name');
            const orderMonthMap = _.groupBy(orderList, 'month');

            const orderByWarehouseList = [];
            const orderByWarehouseListChart = [];

            for (const [key, value] of Object.entries(orderMap)) {
                const pickupTotal = _.filter(value, function (o) {
                    if (o.pickup_pickup_shipper !== null) return o;
                }).length;
                const deliverTotal = _.filter(value, function (o) {
                    if (o.deliver_deliver_shipper !== null) return o;
                }).length;
                orderByWarehouseList.push({
                    warehouseName: key,
                    pickupOrder: pickupTotal,
                    deliverOrder: deliverTotal,
                });
            }

            for (const [key, value] of Object.entries(orderMonthMap)) {
                const pickupTotal = _.filter(value, function (o) {
                    if (o.pickup_pickup_shipper !== null) return o;
                }).length;
                const deliverTotal = _.filter(value, function (o) {
                    if (o.deliver_deliver_shipper !== null) return o;
                }).length;

                orderByWarehouseListChart.push({
                    month: Number(key),
                    pickupOrder: pickupTotal,
                    deliverOrder: deliverTotal,
                });
            }
            const paging: Paging = new Paging(pageNo, this.pageSize, orderByWarehouseList.length);

            const report = Builder<ReportOrderDetail>()
                .reportChart(orderByWarehouseListChart)
                .warehouses(orderByWarehouseList)
                .build();

            return {
                report: report,
                paging: paging,
            };
        } catch (error) {
            Logger.error(error);
            throw new InternalServerErrorException();
        }
    }

    private async getReportOrderQuery(pageNo: number, warehouseIdList?: number[]) {
        const from = this.getRangeMonth().from;
        const to = this.getRangeMonth().to;
        let pickupWarehouse: any;
        let deliverWarehouse: any;

        if (!warehouseIdList) {
            pickupWarehouse = await this.warehouseRepository
                .createQueryBuilder('warehouse')
                .innerJoinAndSelect(AddressEntity, 'address', 'warehouse.address_id = address.address_id')
                .innerJoinAndSelect(InformationEntity, 'information', 'address.address_id = information.address_id')
                .innerJoinAndMapMany(
                    'warehouse.pickupOrders',
                    OrderEntity,
                    'pickupOrders',
                    'information.infor_id = pickupOrders.pickup_infor_id',
                )
                .where('warehouse.is_active = :isActive', { isActive: true })
                .andWhere(
                    new Brackets((qb) => {
                        qb.where('pickupOrders.order_stt = :orderStatus', {
                            orderStatus: OrderStatus.DELIVERED,
                        });
                    }),
                )
                .andWhere('pickupOrders.date_update_at between :from and :to', {
                    from: from,
                    to: to,
                })
                .orderBy('warehouse.warehouse_id', 'ASC')
                .skip((pageNo - 1) * this.pageSize)
                .take(this.pageSize)
                .getRawMany();

            deliverWarehouse = await this.warehouseRepository
                .createQueryBuilder('warehouse')
                .innerJoinAndSelect(AddressEntity, 'address', 'warehouse.address_id = address.address_id')
                .innerJoinAndSelect(InformationEntity, 'information', 'address.address_id = information.address_id')
                .innerJoinAndMapMany(
                    'warehouse.deliverOrders',
                    OrderEntity,
                    'deliverOrders',
                    'information.infor_id = deliverOrders.deliver_infor_id',
                )
                .where('warehouse.is_active = :isActive', { isActive: true })
                .andWhere(
                    new Brackets((qb) => {
                        qb.where('deliverOrders.order_stt = :orderStatus', {
                            orderStatus: OrderStatus.DELIVERED,
                        });
                    }),
                )
                .andWhere('deliverOrders.date_update_at between :from and :to', {
                    from: from,
                    to: to,
                })
                .orderBy('warehouse.warehouse_id', 'ASC')
                .skip((pageNo - 1) * this.pageSize)
                .take(this.pageSize)
                .getRawMany();
        } else {
            pickupWarehouse = await this.warehouseRepository
                .createQueryBuilder('warehouse')
                .innerJoinAndSelect(AddressEntity, 'address', 'warehouse.address_id = address.address_id')
                .innerJoinAndSelect(InformationEntity, 'information', 'address.address_id = information.address_id')
                .innerJoinAndMapMany(
                    'warehouse.pickupOrders',
                    OrderEntity,
                    'pickupOrders',
                    'information.infor_id = pickupOrders.pickup_infor_id',
                )
                .where('warehouse.is_active = :isActive', { isActive: true })
                .andWhere(
                    new Brackets((qb) => {
                        qb.where('pickupOrders.order_stt = :orderStatus', {
                            orderStatus: OrderStatus.DELIVERED,
                        });
                    }),
                )
                .andWhere('pickupOrders.date_update_at between :from and :to', {
                    from: from,
                    to: to,
                })
                .andWhere('warehouse.warehouse_id IN (:...warehouseIdList)', { warehouseIdList: warehouseIdList })
                .orderBy('warehouse.warehouse_id', 'ASC')
                .skip((pageNo - 1) * this.pageSize)
                .take(this.pageSize)
                .getRawMany();

            deliverWarehouse = await this.warehouseRepository
                .createQueryBuilder('warehouse')
                .innerJoinAndSelect(AddressEntity, 'address', 'warehouse.address_id = address.address_id')
                .innerJoinAndSelect(InformationEntity, 'information', 'address.address_id = information.address_id')
                .innerJoinAndMapMany(
                    'warehouse.deliverOrders',
                    OrderEntity,
                    'deliverOrders',
                    'information.infor_id = deliverOrders.deliver_infor_id',
                )
                .where('warehouse.is_active = :isActive', { isActive: true })
                .andWhere(
                    new Brackets((qb) => {
                        qb.where('deliverOrders.order_stt = :orderStatus', {
                            orderStatus: OrderStatus.DELIVERED,
                        });
                    }),
                )
                .andWhere('deliverOrders.date_update_at between :from and :to', {
                    from: from,
                    to: to,
                })
                .andWhere('warehouse.warehouse_id IN (:...warehouseIdList)', { warehouseIdList: warehouseIdList })
                .orderBy('warehouse.warehouse_id', 'ASC')
                .skip((pageNo - 1) * this.pageSize)
                .take(this.pageSize)
                .getRawMany();
        }

        return { pickupWarehouse: pickupWarehouse, deliverWarehouse: deliverWarehouse };
    }

    async getReportAdminStaffDetail(pageNo: number) {
        try {
            const from = this.getRangeMonth().from;
            const to = this.getRangeMonth().to;

            const pickUpStaff: any = await this.staffRepository
                .createQueryBuilder('staff')
                .innerJoinAndMapMany('staff.pickup', OrderEntity, 'pickup', 'staff.staff_id = pickup.pickup_shipper')
                .innerJoinAndSelect(InformationEntity, 'information', 'pickup.pickup_infor_id = information.infor_id')
                .innerJoinAndSelect(AddressEntity, 'address', 'information.address_id = address.address_id')
                .innerJoinAndMapMany(
                    'staff.warehouse',
                    WarehouseEntity,
                    'warehouse',
                    'address.address_id = warehouse.address_id',
                )
                .where('staff.status = :status', { status: 1 })
                .andWhere('pickup.order_stt = :orderStatus', {
                    orderStatus: OrderStatus.DELIVERED,
                })
                .andWhere('pickup.date_update_at between :from and :to', {
                    from: from,
                    to: to,
                })
                .skip((pageNo - 1) * this.pageSize)
                .take(this.pageSize)
                .getRawMany();

            const deliverStaff: any = await this.staffRepository
                .createQueryBuilder('staff')
                .innerJoinAndMapMany(
                    'staff.deliver',
                    OrderEntity,
                    'deliver',
                    'staff.staff_id = deliver.deliver_shipper',
                )
                .innerJoinAndSelect(InformationEntity, 'information', 'deliver.deliver_infor_id = information.infor_id')
                .innerJoinAndSelect(AddressEntity, 'address', 'information.address_id = address.address_id')
                .innerJoinAndMapMany(
                    'staff.warehouse',
                    WarehouseEntity,
                    'warehouse',
                    'address.address_id = warehouse.address_id',
                )
                .where('staff.status = :status', { status: 1 })
                .andWhere('deliver.order_stt = :orderStatus', {
                    orderStatus: OrderStatus.DELIVERED,
                })
                .andWhere('deliver.date_update_at between :from and :to', {
                    from: from,
                    to: to,
                })
                .skip((pageNo - 1) * this.pageSize)
                .take(this.pageSize)
                .getRawMany();

            const orderList = [...pickUpStaff, ...deliverStaff];
            const orderMap = _.groupBy(orderList, 'staff_staff_id');

            const orderByStaffList = [];

            for (const [key, value] of Object.entries(orderMap)) {
                const pickupTotal = _.filter(value, function (o) {
                    if (o.pickup_pickup_shipper !== null) return o;
                }).length;
                const deliverTotal = _.filter(value, function (o) {
                    if (o.deliver_deliver_shipper !== null) return o;
                }).length;
                orderByStaffList.push({
                    staffId: Number(key),
                    staffName: value[0].staff_fullname,
                    warehouseName: value[0].warehouse_warehouse_name,
                    pickupOrder: pickupTotal,
                    deliverOrder: deliverTotal,
                    totalOrder: pickupTotal + deliverTotal,
                });
            }

            const paging: Paging = new Paging(pageNo, this.pageSize, orderByStaffList.length);

            return { reports: orderByStaffList.sort((element) => element.totalOrder), paging: paging };
        } catch (error) {
            Logger.error(error);
            throw new InternalServerErrorException();
        }
    }

    async getReportManagerStaffDetail(userLogin: UserLoginData, pageNo: number) {
        try {
            const from = this.getRangeMonth().from;
            const to = this.getRangeMonth().to;

            const staff: any = await this.staffRepository
                .createQueryBuilder('staff')
                .innerJoinAndSelect(AddressEntity, 'address', 'staff.address_id = address.address_id')
                .innerJoinAndSelect(DistrictEntity, 'district', 'address.district_id = district.district_id')
                .innerJoinAndMapMany('staff.ward', WardEntity, 'ward', 'district.district_id = ward.district')
                .where('staff.acc_id = :accId', { accId: userLogin.accId })
                .getOne();

            if (staff) {
                const pickUpStaff: any = await this.staffRepository
                    .createQueryBuilder('staff')
                    .innerJoinAndMapMany(
                        'staff.pickup',
                        OrderEntity,
                        'pickup',
                        'staff.staff_id = pickup.pickup_shipper',
                    )
                    .innerJoinAndSelect(
                        InformationEntity,
                        'information',
                        'pickup.pickup_infor_id = information.infor_id',
                    )
                    .innerJoinAndSelect(AddressEntity, 'address', 'information.address_id = address.address_id')
                    .innerJoinAndMapMany(
                        'staff.warehouse',
                        WarehouseEntity,
                        'warehouse',
                        'address.address_id = warehouse.address_id',
                    )
                    .where('staff.status = :status', { status: 1 })
                    .andWhere('pickup.order_stt = :orderStatus', {
                        orderStatus: OrderStatus.DELIVERED,
                    })
                    .andWhere('pickup.date_update_at between :from and :to', {
                        from: from,
                        to: to,
                    })
                    .andWhere('staff.staff_id = :staffId', { staffId: staff.staffId })
                    .skip((pageNo - 1) * this.pageSize)
                    .take(this.pageSize)
                    .getRawMany();

                const deliverStaff: any = await this.staffRepository
                    .createQueryBuilder('staff')
                    .innerJoinAndMapMany(
                        'staff.deliver',
                        OrderEntity,
                        'deliver',
                        'staff.staff_id = deliver.deliver_shipper',
                    )
                    .innerJoinAndSelect(
                        InformationEntity,
                        'information',
                        'deliver.deliver_infor_id = information.infor_id',
                    )
                    .innerJoinAndSelect(AddressEntity, 'address', 'information.address_id = address.address_id')
                    .innerJoinAndMapMany(
                        'staff.warehouse',
                        WarehouseEntity,
                        'warehouse',
                        'address.address_id = warehouse.address_id',
                    )
                    .where('staff.status = :status', { status: 1 })
                    .andWhere('deliver.order_stt = :orderStatus', {
                        orderStatus: OrderStatus.DELIVERED,
                    })
                    .andWhere('deliver.date_update_at between :from and :to', {
                        from: from,
                        to: to,
                    })
                    .andWhere('staff.staff_id = :staffId', { staffId: staff.staffId })
                    .skip((pageNo - 1) * this.pageSize)
                    .take(this.pageSize)
                    .getRawMany();

                const orderList = [...pickUpStaff, ...deliverStaff];
                const orderMap = _.groupBy(orderList, 'staff_staff_id');

                const orderByStaffList = [];

                for (const [key, value] of Object.entries(orderMap)) {
                    const pickupTotal = _.filter(value, function (o) {
                        if (o.pickup_pickup_shipper !== null) return o;
                    }).length;
                    const deliverTotal = _.filter(value, function (o) {
                        if (o.deliver_deliver_shipper !== null) return o;
                    }).length;
                    orderByStaffList.push({
                        staffId: Number(key),
                        staffName: value[0].staff_fullname,
                        warehouseName: value[0].warehouse_warehouse_name,
                        pickupOrder: pickupTotal,
                        deliverOrder: deliverTotal,
                        totalOrder: pickupTotal + deliverTotal,
                    });
                }

                const paging: Paging = new Paging(pageNo, this.pageSize, orderByStaffList.length);

                return { reports: orderByStaffList.sort((element) => element.totalOrder), paging: paging };
            }
        } catch (error) {
            Logger.error(error);
            throw new InternalServerErrorException();
        }
    }

    async getReportAdminCustomerDetail(pageNo: number): Promise<any> {
        const from = this.getRangeMonth().from;
        const to = this.getRangeMonth().to;

        const districtPickup: any = await this.districtRepository
            .createQueryBuilder('district')
            .innerJoinAndSelect(AddressEntity, 'address', 'address.district_id = district.district_id')
            .innerJoinAndSelect(InformationEntity, 'information', 'address.address_id = information.address_id')
            .innerJoinAndMapMany(
                'district.pickupOrder',
                OrderEntity,
                'pickupOrder',
                'information.infor_id = pickupOrder.pickup_infor_id',
            )
            .where(
                new Brackets((qb) => {
                    qb.where('pickupOrder.date_update_at between :from and :to', {
                        from: from,
                        to: to,
                    });
                }),
            )
            .andWhere(
                new Brackets((qb) => {
                    qb.where('pickupOrder.order_stt = :orderStatus', {
                        orderStatus: OrderStatus.DELIVERED,
                    });
                }),
            )
            .orderBy('district.district_id', 'ASC')
            .skip((pageNo - 1) * this.pageSize)
            .take(this.pageSize)
            .getRawMany();

        const districtDeliver: any = await this.districtRepository
            .createQueryBuilder('district')
            .innerJoinAndSelect(AddressEntity, 'address', 'address.district_id = district.district_id')
            .innerJoinAndSelect(InformationEntity, 'information', 'address.address_id = information.address_id')
            .innerJoinAndMapMany(
                'district.deliverOrder',
                OrderEntity,
                'deliverOrder',
                'information.infor_id = deliverOrder.deliver_infor_id',
            )
            .where(
                new Brackets((qb) => {
                    qb.where('deliverOrder.date_update_at between :from and :to', {
                        from: from,
                        to: to,
                    });
                }),
            )
            .andWhere(
                new Brackets((qb) => {
                    qb.where('deliverOrder.order_stt = :orderStatus', {
                        orderStatus: OrderStatus.DELIVERED,
                    });
                }),
            )
            .orderBy('district.district_id', 'ASC')
            .skip((pageNo - 1) * this.pageSize)
            .take(this.pageSize)
            .getRawMany();

        const areaList: any[] = [];
        const districtPickupMap = _.groupBy(districtPickup, 'district_district_id');
        const deliverPickupMap = _.groupBy(districtDeliver, 'district_district_id');
        for (const [key, value] of Object.entries(districtPickupMap)) {
            const customerTotal = _.filter(value, function (o) {
                if (o.pickupOrder_cus_id !== null) return o;
            }).length;

            areaList.push({
                districtId: key,
                districtName: value[0].district_district_name,
                totalCustomer: customerTotal,
            });
        }
        for (const [key, value] of Object.entries(deliverPickupMap)) {
            const customerTotal = _.filter(value, function (o) {
                if (o.pickupOrder_cus_id !== null) return o;
            }).length;

            areaList.push({
                districtId: key,
                districtName: value[0].district_district_name,
                totalCustomer: customerTotal,
            });
        }

        const areaOrderList = _.chain(areaList)
            .groupBy('districtId')
            .map(function (value, key) {
                return [
                    key,
                    _.reduce(value, function (result, currentObject) {
                        return {
                            districtId: currentObject.districtId,
                            districtName: currentObject.districtName,
                            totalCustomer: result.totalCustomer + currentObject.totalCustomer,
                        };
                    }),
                ];
            })
            .value();

        const newAreaOrderList: any[] = [];
        areaOrderList.forEach((element) => {
            element.forEach((element2: any) => {
                newAreaOrderList.push({
                    districtId: element2.districtId,
                    totalCustomer: element2.totalCustomer,
                    districtName: element2.districtName,
                });
            });
        });

        const districts = newAreaOrderList.filter((element) => element.districtId !== undefined);

        if (districts) {
            const paging: Paging = new Paging(pageNo, this.pageSize, districts.length);

            const reportDistrict: ReportDistrict = {
                districts: districts,
            };

            return Builder<ReportDistrictResponse>().paging(paging).report(reportDistrict).build();
        }
    }

    async getReportAdminWarehouseDetail(pageNo: number): Promise<ReportWarehouseResponse> {
        const warehouse = await this.getRevenueWarehouseByAdmin(pageNo);

        if (warehouse) {
            const warehousePickupMap = _.groupBy(warehouse.pickupOrder, 'warehouse_warehouse_name');
            const warehouseDeliverMap = _.groupBy(warehouse.deliverOrder, 'warehouse_warehouse_name');

            const warehouseList: Warehouse[] = [];
            for (const [key, value] of Object.entries(warehousePickupMap)) {
                const pickupTotal = (_.sumBy(value, 'pickupOrder_estimated_price') / 100) * 40;

                warehouseList.push({
                    warehouseId: value[0].warehouse_warehouse_id,
                    warehouseName: key,
                    totalRevenue: pickupTotal,
                });
            }
            for (const [key, value] of Object.entries(warehouseDeliverMap)) {
                const deliverTotal = (_.sumBy(value, 'deliverOrder_estimated_price') / 100) * 60;

                warehouseList.push({
                    warehouseId: value[0].warehouse_warehouse_id,
                    warehouseName: key,
                    totalRevenue: deliverTotal,
                });
            }

            const warehouseOrderList = _.chain(warehouseList)
                .groupBy('warehouseId')
                .map(function (value, key) {
                    return [
                        key,
                        _.reduce(value, function (result, currentObject) {
                            return {
                                warehouseId: currentObject.warehouseId,
                                warehouseName: currentObject.warehouseName,
                                totalRevenue: result.totalRevenue + currentObject.totalRevenue,
                            };
                        }),
                    ];
                })
                .value();

            const newWarehouseList: Warehouse[] = [];
            warehouseOrderList.forEach((element) => {
                element.forEach((element2: any) => {
                    newWarehouseList.push({
                        warehouseId: element2.warehouseId,
                        totalRevenue: element2.totalRevenue,
                        warehouseName: element2.warehouseName,
                    });
                });
            });

            const startDate = this.getRangeMonth().from;
            const toDate = this.getRangeMonth().to;
            const reportChart = await this.getRevenueWarehouseByAdminChart(pageNo, startDate, toDate);

            const paging: Paging = new Paging(pageNo, this.pageSize, warehouseList.length);

            return this.toReportWarehouseResponse(
                newWarehouseList.filter((element) => element.warehouseId !== undefined),
                reportChart,
                paging,
            );
        }

        return { report: null, paging: null };
    }

    private async getRevenueWarehouseByAdminChart(pageNo: number, from: string, to: string) {
        const warehouseChart = await this.getRevenueWarehouseByAdmin(pageNo, from, to);

        if (warehouseChart) {
            const pickupOrderList = warehouseChart.pickupOrder;
            const deliverOrderList = warehouseChart.deliverOrder;

            pickupOrderList.forEach((element) => {
                element.month = moment(element.pickupOrder_date_update_at).month() + 1;
            });
            deliverOrderList.forEach((element) => {
                element.month = moment(element.deliverOrder_date_update_at).month() + 1;
            });
            const pickupOrderMap = _.chain(pickupOrderList).groupBy('month').value();
            const deliverOrderMap = _.chain(deliverOrderList).groupBy('month').value();

            const warehouseList: any[] = [];
            for (const [key, value] of Object.entries(pickupOrderMap)) {
                const pickupTotal = (_.sumBy(value, 'pickupOrder_estimated_price') / 100) * 40;

                warehouseList.push({
                    warehouseId: value[0].warehouse_warehouse_id,
                    month: key,
                    totalRevenue: pickupTotal,
                });
            }

            for (const [key, value] of Object.entries(deliverOrderMap)) {
                const deliverTotal = (_.sumBy(value, 'deliverOrder_estimated_price') / 100) * 60;

                warehouseList.push({
                    warehouseId: value[0].warehouse_warehouse_id,
                    month: key,
                    totalRevenue: deliverTotal,
                });
            }

            return warehouseList.reduce((obj, el) => {
                obj[el.month] = (obj[el.month] || 0) + el.totalRevenue;
                return obj;
            }, {});
        }
    }

    private async getRevenueWarehouseByAdmin(pageNo: number, from?: string, to?: string): Promise<any> {
        from = from ? from : this.getRangeMonth().from;
        to = to ? to : this.getRangeMonth().to;

        const pickupOrder = await this.warehouseRepository
            .createQueryBuilder('warehouse')
            .innerJoinAndSelect(AddressEntity, 'address', 'warehouse.address_id = address.address_id')
            .innerJoinAndSelect(InformationEntity, 'information', 'address.address_id = information.address_id')
            .innerJoinAndMapMany(
                'warehouse.pickupOrder',
                OrderEntity,
                'pickupOrder',
                'information.infor_id = pickupOrder.pickup_infor_id',
            )
            .where(
                new Brackets((qb) => {
                    qb.where('pickupOrder.order_stt = :orderStatus', {
                        orderStatus: OrderStatus.DELIVERED,
                    });
                }),
            )
            .andWhere('warehouse.is_active = :isActive', { isActive: true })
            .andWhere(
                new Brackets((qb) => {
                    qb.where('pickupOrder.date_update_at between :from and :to', {
                        from: from,
                        to: to,
                    });
                }),
            )
            .orderBy('warehouse.warehouse_id', 'ASC')
            .skip((pageNo - 1) * this.pageSize)
            .take(this.pageSize)
            .getRawMany();

        const deliverOrder = await this.warehouseRepository
            .createQueryBuilder('warehouse')
            .innerJoinAndSelect(AddressEntity, 'address', 'warehouse.address_id = address.address_id')
            .innerJoinAndSelect(InformationEntity, 'information', 'address.address_id = information.address_id')
            .innerJoinAndMapMany(
                'warehouse.deliverOrder',
                OrderEntity,
                'deliverOrder',
                'information.infor_id = deliverOrder.deliver_infor_id',
            )
            .where(
                new Brackets((qb) => {
                    qb.where('deliverOrder.order_stt = :orderStatus', {
                        orderStatus: OrderStatus.DELIVERED,
                    });
                }),
            )
            .andWhere('warehouse.is_active = :isActive', { isActive: true })
            .andWhere(
                new Brackets((qb) => {
                    qb.where('deliverOrder.date_update_at between :from and :to', {
                        from: from,
                        to: to,
                    });
                }),
            )
            .orderBy('warehouse.warehouse_id', 'ASC')
            .skip((pageNo - 1) * this.pageSize)
            .take(this.pageSize)
            .getRawMany();

        return { pickupOrder: pickupOrder, deliverOrder: deliverOrder };
    }

    async getReportAdminAreaDetail(pageNo: number): Promise<ReportDistrictResponse> {
        const districts = await this.getReportAdminAreaQuery(pageNo);

        if (districts) {
            const paging: Paging = new Paging(pageNo, this.pageSize, districts.length);

            return this.toReportDistrictResponse(districts, paging);
        }
    }

    private async getReportAdminAreaQuery(pageNo: number) {
        const from = this.getRangeMonth().from;
        const to = this.getRangeMonth().to;

        const districtPickup: any = await this.districtRepository
            .createQueryBuilder('district')
            .innerJoinAndSelect(AddressEntity, 'address', 'address.district_id = district.district_id')
            .innerJoinAndSelect(InformationEntity, 'information', 'address.address_id = information.address_id')
            .innerJoinAndMapMany(
                'district.pickupOrder',
                OrderEntity,
                'pickupOrder',
                'information.infor_id = pickupOrder.pickup_infor_id',
            )
            .where(
                new Brackets((qb) => {
                    qb.where('pickupOrder.date_update_at between :from and :to', {
                        from: from,
                        to: to,
                    });
                }),
            )
            .andWhere(
                new Brackets((qb) => {
                    qb.where('pickupOrder.order_stt = :orderStatus', {
                        orderStatus: OrderStatus.DELIVERED,
                    });
                }),
            )
            .orderBy('district.district_id', 'ASC')
            .skip((pageNo - 1) * this.pageSize)
            .take(this.pageSize)
            .getRawMany();

        const districtDeliver: any = await this.districtRepository
            .createQueryBuilder('district')
            .innerJoinAndSelect(AddressEntity, 'address', 'address.district_id = district.district_id')
            .innerJoinAndSelect(InformationEntity, 'information', 'address.address_id = information.address_id')
            .innerJoinAndMapMany(
                'district.deliverOrder',
                OrderEntity,
                'deliverOrder',
                'information.infor_id = deliverOrder.deliver_infor_id',
            )
            .where(
                new Brackets((qb) => {
                    qb.where('deliverOrder.date_update_at between :from and :to', {
                        from: from,
                        to: to,
                    });
                }),
            )
            .andWhere(
                new Brackets((qb) => {
                    qb.where('deliverOrder.order_stt = :orderStatus', {
                        orderStatus: OrderStatus.DELIVERED,
                    });
                }),
            )
            .orderBy('district.district_id', 'ASC')
            .skip((pageNo - 1) * this.pageSize)
            .take(this.pageSize)
            .getRawMany();

        const areaList: any[] = [];
        const districtPickupMap = _.groupBy(districtPickup, 'district_district_id');
        const deliverPickupMap = _.groupBy(districtDeliver, 'district_district_id');
        for (const [key, value] of Object.entries(districtPickupMap)) {
            const pickupTotal = (_.sumBy(value, 'pickupOrder_estimated_price') / 100) * 40;

            areaList.push({
                districtId: key,
                districtName: value[0].district_district_name,
                totalRevenue: pickupTotal,
            });
        }
        for (const [key, value] of Object.entries(deliverPickupMap)) {
            const deliverTotal = (_.sumBy(value, 'deliverOrder_estimated_price') / 100) * 60;

            areaList.push({
                districtId: key,
                districtName: value[0].district_district_name,
                totalRevenue: deliverTotal,
            });
        }

        const areaOrderList = _.chain(areaList)
            .groupBy('districtId')
            .map(function (value, key) {
                return [
                    key,
                    _.reduce(value, function (result, currentObject) {
                        return {
                            districtId: currentObject.districtId,
                            districtName: currentObject.districtName,
                            totalRevenue: result.totalRevenue + currentObject.totalRevenue,
                        };
                    }),
                ];
            })
            .value();

        const newAreaOrderList: any[] = [];
        areaOrderList.forEach((element) => {
            element.forEach((element2: any) => {
                newAreaOrderList.push({
                    districtId: element2.districtId,
                    totalRevenue: element2.totalRevenue,
                    districtName: element2.districtName,
                });
            });
        });

        return newAreaOrderList.filter((element) => element.districtId !== undefined);
    }

    private toReportDistrictResponse(districts: District[], paging: Paging): ReportDistrictResponse {
        const reportDistrict: ReportDistrict = {
            districts: districts,
        };

        return Builder<ReportDistrictResponse>().paging(paging).report(reportDistrict).build();
    }

    private toReportWarehouseResponse(
        warehouses: Warehouse[],
        reportChart: any,
        paging: Paging,
    ): ReportWarehouseResponse {
        const reportWarehouse: ReportWarehouse = {
            reportChart: reportChart,
            warehouses: warehouses,
        };

        return Builder<ReportWarehouseResponse>().paging(paging).report(reportWarehouse).build();
    }

    /**
     * Get staff info by staff login.
     *
     * @param userLogin UserLoginData
     */
    private async getWarehouseIdByStaff(userLogin: UserLoginData): Promise<number[]> {
        const staff: any = await this.staffRepository
            .createQueryBuilder('staff')
            .innerJoinAndSelect(AddressEntity, 'address', 'staff.address_id = address.address_id')
            .innerJoinAndSelect(DistrictEntity, 'district', 'address.district_id = district.district_id')
            .innerJoinAndMapMany('staff.ward', WardEntity, 'ward', 'district.district_id = ward.district')
            .where('staff.acc_id = :accId', { accId: userLogin.accId })
            .getOne();

        if (staff) {
            const warehouseIdSet: Set<number> = new Set<number>(staff.ward.map((w) => w.warehouseId));
            return Array.from(warehouseIdSet.values());
        }

        return [];
    }

    private getRangeMonth() {
        const from = moment().subtract(2, 'month').startOf('month').format('YYYY-MM-DD');
        const to = moment().endOf('month').format('YYYY-MM-DD');

        return { from: from, to: to };
    }
}
