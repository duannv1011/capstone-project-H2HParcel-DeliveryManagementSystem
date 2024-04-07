import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Builder } from 'builder-pattern';
import {
    OrderByArea,
    ReportDashboard,
    ReportDashboardResponse,
    ReportOrderDetail,
    ReportOrderDetailResponse,
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
import { ReportStaff, ReportStaffResponse } from './response/report-staff.response';
import { Customer, ReportCustomer, ReportCustomerResponse } from './response/report-customer.response';
import { CustomerEntity } from '../../../entities/customer.entity';
import { OrderStatus } from '../../../enum/order-status.enum';
import { ReportWarehouse, ReportWarehouseResponse, Warehouse } from './response/report-warehouse.reponse';
import { District, ReportDistrict, ReportDistrictResponse } from './response/report-district.reponse';

@Injectable()
export class ReportService {
    constructor(
        @InjectRepository(StaffEntity)
        private staffRepository: Repository<StaffEntity>,
        @InjectRepository(WarehouseEntity)
        private warehouseRepository: Repository<WarehouseEntity>,
        @InjectRepository(OrderEntity)
        private orderRepository: Repository<OrderEntity>,
        @InjectRepository(WardEntity)
        private wardRepository: Repository<WardEntity>,
        @InjectRepository(DistrictEntity)
        private districtRepository: Repository<DistrictEntity>,
    ) {}

    pageSize = Number(process.env.PAGE_SIZE);

    async getReportAdmin(from?: string, to?: string): Promise<ReportDashboardResponse> {
        try {
            const revenueTotal = await this.calculationAdminRevenueTotal();
            const orderTotal = await this.calculationOrderTotal(null, from, to);
            const staffTotal = await this.calculationStaffTotal();

            return {
                reportDashboard: this.toAdminReportDashboard(revenueTotal, orderTotal, staffTotal),
            };
        } catch (error) {
            Logger.error(error);
            throw new InternalServerErrorException();
        }
    }

    async getReportManager(userLogin: UserLoginData, from?: string, to?: string): Promise<ReportDashboardResponse> {
        try {
            const warehouseIdList = await this.getWarehouseIdByStaff(userLogin);

            if (warehouseIdList.length > 0) {
                const revenuePickupTotal = await this.calculationRevenuePickup(warehouseIdList, from, to);
                const revenueDeliverTotal = await this.calculationRevenueDeliver(warehouseIdList);
                const orderTotal = await this.calculationOrderTotal(warehouseIdList, from, to);
                const staffTotal = await this.calculationStaffTotal(warehouseIdList);

                return {
                    reportDashboard: this.toManagerReportDashboard(
                        revenuePickupTotal + revenueDeliverTotal,
                        orderTotal,
                        staffTotal,
                    ),
                };
            }

            return { reportDashboard: null };
        } catch (error) {
            Logger.error(error);
            throw new InternalServerErrorException();
        }
    }

    async getReportManagerOrderDetail(
        userLogin: UserLoginData,
        pageNo: number,
        from: string,
        to: string,
    ): Promise<ReportOrderDetailResponse> {
        try {
            const warehouseIdList = await this.getWarehouseIdByStaff(userLogin);

            if (warehouseIdList.length > 0) {
                const warehouses: any = await this.warehouseRepository
                    .createQueryBuilder('warehouse')
                    .innerJoinAndMapMany(
                        'warehouse.pickupOrders',
                        OrderEntity,
                        'pickupOrders',
                        'warehouse.address_id = pickupOrders.pickup_infor_id',
                    )
                    .innerJoinAndMapMany(
                        'warehouse.deliverOrders',
                        OrderEntity,
                        'deliverOrders',
                        'warehouse.address_id = deliverOrders.deliver_infor_id',
                    )
                    .where('warehouse.warehouse_id IN (:...warehouseIdList)', { warehouseIdList: warehouseIdList })
                    .andWhere('warehouse.is_active = :isActive', { isActive: true })
                    .orderBy('warehouse.warehouse_id', 'ASC')
                    .skip((pageNo - 1) * this.pageSize)
                    .take(this.pageSize)
                    .getRawMany();

                let total: number = 0;

                if (warehouses) {
                    total = warehouses.length;
                }

                const paging: Paging = new Paging(pageNo, this.pageSize, total);
                const reportOrderDetailResponse = await this.toReportOrderDetailResponse(
                    warehouses,
                    warehouseIdList,
                    total,
                    from,
                    to,
                );

                return {
                    report: reportOrderDetailResponse,
                    paging: paging,
                };
            }
        } catch (error) {
            Logger.error(error);
            throw new InternalServerErrorException();
        }
    }

    async getReportAdminOrderDetail(pageNo: number, from?: string, to?: string): Promise<ReportOrderDetailResponse> {
        from = from ? from : this.getCurrentMonth().from;
        to = to ? to : this.getCurrentMonth().to;

        try {
            const warehouses: any = await this.warehouseRepository
                .createQueryBuilder('warehouse')
                .innerJoinAndMapMany(
                    'warehouse.pickupOrders',
                    OrderEntity,
                    'pickupOrders',
                    'warehouse.address_id = pickupOrders.pickup_infor_id',
                )
                .innerJoinAndMapMany(
                    'warehouse.deliverOrders',
                    OrderEntity,
                    'deliverOrders',
                    'warehouse.address_id = deliverOrders.deliver_infor_id',
                )
                .where('warehouse.is_active = :isActive', { isActive: true })
                .orderBy('warehouse.warehouse_id', 'ASC')
                .skip((pageNo - 1) * this.pageSize)
                .take(this.pageSize)
                .getRawMany();

            let total: number = 0;

            if (warehouses) {
                total = warehouses.length;
            }

            const paging: Paging = new Paging(pageNo, this.pageSize, total);
            const reportOrderDetailResponse = await this.toReportOrderDetailResponse(warehouses, null, total, from, to);

            return {
                report: reportOrderDetailResponse,
                paging: paging,
            };
        } catch (error) {
            Logger.error(error);
            throw new InternalServerErrorException();
        }
    }

    async getReportManagerStaffDetail(
        userLogin: UserLoginData,
        pageNo: number,
        from?: string,
        to?: string,
    ): Promise<ReportStaffResponse> {
        try {
            const warehouseIdList = await this.getWarehouseIdByStaff(userLogin);
            const staffs: any = await this.staffRepository
                .createQueryBuilder('staffs')
                .innerJoinAndSelect(WarehouseEntity, 'warehouse', 'warehouse.warehouse_id = staffs.warehouse_id')
                .where('warehouse.warehouse_id IN (:...warehouseIdList)', { warehouseIdList: warehouseIdList })
                .orderBy('staffs.staff_id', 'ASC')
                .skip((pageNo - 1) * this.pageSize)
                .take(this.pageSize)
                .getRawMany();

            const paging: Paging = new Paging(pageNo, this.pageSize, staffs.length);
            const reports: ReportStaff[] = [];
            for (const element of staffs) {
                reports.push(await this.toReportStaffResponse(element, from, to));
            }

            return { reports: reports, paging: paging };
        } catch (error) {
            Logger.error(error);
            throw new InternalServerErrorException();
        }
    }

    async getReportAdminStaffDetail(pageNo: number, from?: string, to?: string) {
        from = from ? from : this.getCurrentMonth().from;
        to = to ? to : this.getCurrentMonth().to;

        try {
            const staffs: any = await this.staffRepository
                .createQueryBuilder('staffs')
                .innerJoinAndSelect(WarehouseEntity, 'warehouse', 'warehouse.warehouse_id = staffs.warehouse_id')
                .orderBy('staffs.staff_id', 'ASC')
                .skip((pageNo - 1) * this.pageSize)
                .take(this.pageSize)
                .getRawMany();

            const paging: Paging = new Paging(pageNo, this.pageSize, staffs.length);
            const reports: ReportStaff[] = [];
            if (staffs) {
                for (const element of staffs) {
                    reports.push(await this.toReportStaffResponse(element, from, to));
                }
            }

            return { reports: reports, paging: paging };
        } catch (error) {
            Logger.error(error);
            throw new InternalServerErrorException();
        }
    }

    async getReportAdminCustomerDetail(pageNo: number, from?: string, to?: string): Promise<ReportCustomerResponse> {
        from = from ? from : this.getCurrentMonth().from;
        to = to ? to : this.getCurrentMonth().to;

        const wards = await this.wardRepository
            .createQueryBuilder('ward')
            .innerJoinAndSelect(AddressEntity, 'address', 'ward.ward_id = address.ward_id')
            .innerJoinAndSelect(CustomerEntity, 'customer', 'address.address_id = customer.address_id')
            .innerJoinAndMapMany('ward.orders', OrderEntity, 'order', 'customer.cus_id = order.cus_id')
            .where('order.date_update_at between :from and :to', {
                from: from,
                to: to,
            })
            .andWhere('order.order_stt = :statusComplete', { statusComplete: OrderStatus.DELIVERED })
            .orderBy('ward.ward_id', 'ASC')
            .skip((pageNo - 1) * this.pageSize)
            .take(this.pageSize)
            .getRawMany();

        if (wards) {
            const customerMap = _.countBy(wards, 'ward_ward_name');
            const dayMap = _.countBy(wards, 'order_date_update_at');

            const customers: Customer[] = [];
            for (const [key, value] of Object.entries(customerMap)) {
                if (typeof value === 'number') {
                    customers.push({ wardName: key, totalCustomer: value });
                }
            }
            const countByDays = [];
            for (const [key, value] of Object.entries(dayMap)) {
                countByDays.push({ day: new Date(key).getDay(), totalCustomer: value });
            }
            const totalByDays = _.countBy(countByDays, 'day');
            const reportChart = [];
            for (const [key, value] of Object.entries(totalByDays)) {
                reportChart.push({ day: key, totalCustomer: value });
            }

            const paging: Paging = new Paging(pageNo, this.pageSize, customers.length);

            return this.toReportCustomerResponse(customers, reportChart, paging);
        }

        return { report: null, paging: null };
    }

    async getReportAdminWarehouseDetail(pageNo: number, from?: string, to?: string): Promise<ReportWarehouseResponse> {
        from = from ? from : this.getCurrentMonth().from;
        to = to ? to : this.getCurrentMonth().to;

        const warehouses: any = await this.warehouseRepository
            .createQueryBuilder('warehouse')
            .innerJoinAndSelect(StaffEntity, 'staff', 'warehouse.warehouse_id = staff.warehouse_id')
            .innerJoinAndMapMany(
                'warehouse.pickupOrder',
                OrderEntity,
                'pickupOrder',
                'staff.staff_id = pickupOrder.pickup_shipper',
            )
            .innerJoinAndMapMany(
                'warehouse.deliverOrder',
                OrderEntity,
                'deliverOrder',
                'staff.staff_id = deliverOrder.deliver_shipper',
            )
            .andWhere(
                new Brackets((qb) => {
                    qb.where('pickupOrder.date_update_at between :from and :to', {
                        from: from,
                        to: to,
                    }).orWhere('deliverOrder.date_update_at between :from and :to', {
                        from: from,
                        to: to,
                    });
                }),
            )
            .andWhere('warehouse.is_active = :isActive', { isActive: true })
            .orderBy('warehouse.warehouse_id', 'ASC')
            .skip((pageNo - 1) * this.pageSize)
            .take(this.pageSize)
            .getRawMany();

        if (warehouses) {
            const warehouseMap = _.groupBy(warehouses, 'warehouse_warehouse_name');
            const dayPickupMap = _.groupBy(warehouses, 'pickupOrder_date_update_at');
            const dayDeliverMap = _.groupBy(warehouses, 'deliverOrder_date_update_at');

            const warehouseList: Warehouse[] = [];
            for (const [key, value] of Object.entries(warehouseMap)) {
                const pickupTotal = (_.sumBy(value, 'pickupOrder_estimated_price') / 100) * 40;
                const deliverTotal = (_.sumBy(value, 'deliverOrder_estimated_price') / 100) * 60;

                warehouseList.push({
                    warehouseId: value[0].warehouse_warehouse_id,
                    warehouseName: key,
                    totalRevenue: pickupTotal + deliverTotal,
                });
            }

            const countByPickupDays = [];
            for (const [key, value] of Object.entries(dayPickupMap)) {
                const pickupTotal = (_.sumBy(value, 'pickupOrder_estimated_price') / 100) * 40;

                countByPickupDays.push({ day: new Date(key).getDay(), totalRevenue: pickupTotal });
            }

            const countByDeliverDays = [];
            for (const [key, value] of Object.entries(dayDeliverMap)) {
                const deliverTotal = (_.sumBy(value, 'deliverOrder_estimated_price') / 100) * 60;

                countByPickupDays.push({ day: new Date(key).getDay(), totalRevenue: deliverTotal });
            }
            const orderList = [...countByDeliverDays, ...countByPickupDays];
            const orderMap = _.groupBy(orderList, 'day');

            const reportChart = [];
            for (const [key, value] of Object.entries(orderMap)) {
                const total = _.sumBy(value, 'totalRevenue');

                reportChart.push({
                    day: key,
                    totalRevenueInDay: total,
                });
            }
            const totalRevenue = _.sumBy(reportChart, 'totalRevenueInDay');

            const paging: Paging = new Paging(pageNo, this.pageSize, warehouseList.length);

            return this.toReportWarehouseResponse(warehouseList, reportChart, totalRevenue, paging);
        }

        return { report: null, paging: null };
    }

    async getReportAdminAreaDetail(pageNo: number, from?: string, to?: string): Promise<ReportDistrictResponse> {
        from = from ? from : this.getCurrentMonth().from;
        to = to ? to : this.getCurrentMonth().to;

        const districts: any = await this.districtRepository
            .createQueryBuilder('district')
            .innerJoinAndSelect(AddressEntity, 'address', 'address.district_id = district.district_id')
            .innerJoinAndMapMany(
                'district.customer',
                CustomerEntity,
                'customer',
                'customer.address_id = address.address_id',
            )
            .innerJoinAndSelect(OrderEntity, 'pickupOrder', 'customer.cus_id = pickupOrder.pickup_shipper')
            .innerJoinAndSelect(OrderEntity, 'deliverOrder', 'customer.cus_id = deliverOrder.deliver_shipper')
            .where(
                new Brackets((qb) => {
                    qb.where('pickupOrder.date_update_at between :from and :to', {
                        from: from,
                        to: to,
                    }).orWhere('deliverOrder.date_update_at between :from and :to', {
                        from: from,
                        to: to,
                    });
                }),
            )
            .orderBy('district.district_id', 'ASC')
            .skip((pageNo - 1) * this.pageSize)
            .take(this.pageSize)
            .getRawMany();

        if (districts) {
            const districtMap = _.groupBy(districts, 'district_district_name');
            const dayPickupMap = _.groupBy(districts, 'pickupOrder_date_update_at');
            const dayDeliverMap = _.groupBy(districts, 'deliverOrder_date_update_at');

            const districtList: District[] = [];
            for (const [key, value] of Object.entries(districtMap)) {
                districtList.push({
                    districtId: value[0].district_district_id,
                    districtName: key,
                    totalCustomer: value.length,
                });
            }

            const countByPickupDays = [];
            for (const [key, value] of Object.entries(dayPickupMap)) {
                const pickupTotal = _.countBy(value, 'customer_cus_id');
                let totalPickupInDay = 0;
                for (const [, value] of Object.entries(pickupTotal)) {
                    if (typeof value === 'number') {
                        totalPickupInDay = value;
                    }
                }

                countByPickupDays.push({ day: new Date(key).getDay(), totalCustomer: totalPickupInDay });
            }

            const countByDeliverDays = [];
            for (const [key, value] of Object.entries(dayDeliverMap)) {
                const deliverTotal = _.countBy(value, 'customer_cus_id');
                let totalDeliverInDay = 0;
                for (const [, value] of Object.entries(deliverTotal)) {
                    if (typeof value === 'number') {
                        totalDeliverInDay = value;
                    }
                }
                countByPickupDays.push({ day: new Date(key).getDay(), totalCustomer: totalDeliverInDay });
            }
            const orderList = [...countByDeliverDays, ...countByPickupDays];
            const orderMap = _.groupBy(orderList, 'day');
            console.log(orderMap);

            const reportChart = [];
            for (const [key, value] of Object.entries(orderMap)) {
                const total = _.countBy(value, 'totalCustomer');

                let totalCustomer = 0;
                for (const [, value] of Object.entries(total)) {
                    if (typeof value === 'number') {
                        totalCustomer = value;
                    }
                }

                reportChart.push({
                    day: key,
                    totalCustomerInDay: totalCustomer,
                });
            }
            let totalCustomer = 0;
            for (const [, value] of Object.entries(_.countBy(districtList, 'totalCustomer'))) {
                if (typeof value === 'number') {
                    totalCustomer = value;
                }
            }
            const paging: Paging = new Paging(pageNo, this.pageSize, districtList.length);

            return this.toReportDistrictResponse(districtList, reportChart, totalCustomer, paging);
        }
    }

    private toReportDistrictResponse(
        districts: District[],
        reportChart: any,
        totalCustomer: number,
        paging: Paging,
    ): ReportDistrictResponse {
        const reportDistrict: ReportDistrict = {
            reportChart: reportChart,
            districts: districts,
            totalCustomer: totalCustomer,
        };

        return Builder<ReportDistrictResponse>().paging(paging).report(reportDistrict).build();
    }

    private toReportWarehouseResponse(
        warehouses: Warehouse[],
        reportChart: any,
        totalRevenue: number,
        paging: Paging,
    ): ReportWarehouseResponse {
        const reportWarehouse: ReportWarehouse = {
            reportChart: reportChart,
            totalRevenue: totalRevenue,
            warehouses: warehouses,
        };

        return Builder<ReportWarehouseResponse>().paging(paging).report(reportWarehouse).build();
    }

    private toReportCustomerResponse(customers: Customer[], reportChart: any, paging: Paging): ReportCustomerResponse {
        const reportCustomer: ReportCustomer = { reportChart: reportChart, customers: customers };

        return Builder<ReportCustomerResponse>().paging(paging).report(reportCustomer).build();
    }

    private async toReportStaffResponse(staff: any, from?: string, to?: string): Promise<ReportStaff> {
        const staffOrder = await this.calculationStaffOrder(staff.staffs_staff_id, from, to);
        if (staffOrder) {
            return Builder<ReportStaff>()
                .staffId(staff.staffs_staff_id)
                .staffName(staff.staffs_fullname)
                .warehouseName(staff.warehouse_warehouse_name)
                .totalOrder(staffOrder.totalOrder)
                .revenue(staffOrder.totalRevenue)
                .build();
        }

        return Builder<ReportStaff>().build();
    }

    private async calculationStaffOrder(staffId: number, from?: string, to?: string): Promise<any> {
        from = from ? from : this.getCurrentMonth().from;
        to = to ? to : this.getCurrentMonth().to;

        const staff: any = await this.staffRepository
            .createQueryBuilder('staff')
            .innerJoinAndMapMany('staff.pickup', OrderEntity, 'pickup', 'staff.staff_id = pickup.pickup_shipper')
            .innerJoinAndMapMany('staff.deliver', OrderEntity, 'deliver', 'staff.staff_id = deliver.deliver_shipper')
            .where('staff.staff_id = :staffId', { staffId: staffId })
            .andWhere(
                new Brackets((qb) => {
                    qb.where('pickup.date_update_at between :from and :to', {
                        from: from,
                        to: to,
                    }).orWhere('deliver.date_update_at between :from and :to', {
                        from: from,
                        to: to,
                    });
                }),
            )
            .getOne();

        if (staff) {
            const pickup = staff.pickup;
            let pickupRevenue: number = 0;
            const pickupRevenues = pickup.map((element) => (element.estimatedPrice / 100) * 40);
            pickupRevenues.forEach((element) => {
                pickupRevenue += element;
            });

            const deliver = staff.deliver;
            let deliverRevenue: number = 0;
            const deliverRevenues = deliver.map((element) => (element.estimatedPrice / 100) * 60);
            deliverRevenues.forEach((element) => {
                deliverRevenue += element;
            });
            const totalOrder = pickup.length + deliver.length;

            return { totalOrder: totalOrder, totalRevenue: pickupRevenue + deliverRevenue };
        }
    }

    private async toReportOrderDetailResponse(
        warehouses: any,
        warehouseIdList: number[],
        orderTotal: number,
        from?: string,
        to?: string,
    ): Promise<ReportOrderDetail> {
        return {
            reportChart: await this.toOrderDetailChart(warehouseIdList, from, to),
            orderByArea: await this.toOrderByArea(warehouses, warehouseIdList),
            orderTotal: orderTotal,
        };
    }

    private async toOrderDetailChart(warehouseIdList: number[], from?: string, to?: string): Promise<any> {
        from = from ? from : this.getCurrentMonth().from;
        to = to ? to : this.getCurrentMonth().to;

        if (warehouseIdList) {
            const order: any = await this.warehouseRepository
                .createQueryBuilder('warehouse')
                .innerJoinAndSelect(StaffEntity, 'staff', 'warehouse.warehouse_id = staff.warehouse_id')
                .innerJoinAndMapMany(
                    'warehouse.pickupOrder',
                    OrderEntity,
                    'pickupOrder',
                    'staff.staff_id = pickupOrder.pickup_shipper',
                )
                .innerJoinAndMapMany(
                    'warehouse.deliverOrder',
                    OrderEntity,
                    'deliverOrder',
                    'staff.staff_id = deliverOrder.deliver_shipper',
                )
                .where('warehouse.warehouse_id IN (:...warehouseIdList)', { warehouseIdList: warehouseIdList })
                .andWhere('pickupOrder.date_update_at between :from and :to', { from: from, to: to })
                .andWhere(
                    new Brackets((qb) => {
                        qb.where('pickupOrder.date_update_at between :from and :to', {
                            from: from,
                            to: to,
                        }).orWhere('deliverOrder.date_update_at between :from and :to', {
                            from: from,
                            to: to,
                        });
                    }),
                )
                .andWhere('warehouse.is_active = :isActive', { isActive: true })
                .getOne();

            if (order) {
                const orderList = [];
                const pickupOrders = order.pickupOrder;
                const deliverOrders = order.deliverOrder;

                if (pickupOrders) {
                    pickupOrders.forEach((element) => {
                        orderList.push({
                            day: element.date_update_at.getDay(),
                        });
                    });
                }
                if (deliverOrders) {
                    deliverOrders.forEach((element) => {
                        orderList.push({
                            day: element.date_update_at.getDay(),
                        });
                    });
                }

                return _.countBy(orderList, 'day');
            }
        } else {
            // Admin
            const order: any = await this.warehouseRepository
                .createQueryBuilder('warehouse')
                .innerJoinAndSelect(StaffEntity, 'staff', 'warehouse.warehouse_id = staff.warehouse_id')
                .innerJoinAndMapMany(
                    'warehouse.pickupOrder',
                    OrderEntity,
                    'pickupOrder',
                    'staff.staff_id = pickupOrder.pickup_shipper',
                )
                .innerJoinAndMapMany(
                    'warehouse.deliverOrder',
                    OrderEntity,
                    'deliverOrder',
                    'staff.staff_id = deliverOrder.deliver_shipper',
                )
                .where('pickupOrder.date_update_at between :from and :to', { from: from, to: to })
                .andWhere(
                    new Brackets((qb) => {
                        qb.where('pickupOrder.date_update_at between :from and :to', {
                            from: from,
                            to: to,
                        }).orWhere('deliverOrder.date_update_at between :from and :to', {
                            from: from,
                            to: to,
                        });
                    }),
                )
                .andWhere('warehouse.is_active = :isActive', { isActive: true })
                .getOne();

            if (order) {
                const orderList = [];
                const pickupOrders = order.pickupOrder;
                const deliverOrders = order.deliverOrder;

                if (pickupOrders) {
                    pickupOrders.forEach((element) => {
                        orderList.push({
                            day: element.date_update_at.getDay(),
                        });
                    });
                }
                if (deliverOrders) {
                    deliverOrders.forEach((element) => {
                        orderList.push({
                            day: element.date_update_at.getDay(),
                        });
                    });
                }

                return _.countBy(orderList, 'day');
            }
        }
    }

    private async toOrderByArea(warehouses: any, warehouseIdList: number[]): Promise<OrderByArea[]> {
        const orderByAreas: OrderByArea[] = [];
        if (warehouseIdList) {
            warehouseIdList.forEach((warehouseId) => {
                const warehouse = warehouses.filter((element) => element.warehouse_warehouse_id === warehouseId);
                const deliverOrderTotal = warehouses
                    .filter((element) => element.warehouse_warehouse_id === warehouseId)
                    .filter((element) => element.pickupOrders_order_id !== null).length;
                const pickupOrderTotal = warehouses
                    .filter((element) => element.warehouse_warehouse_id === warehouseId)
                    .filter((element) => element.deliverOrders_order_id !== null).length;

                orderByAreas.push({
                    warehouseName: warehouse.map((element) => element.warehouse_warehouse_name)[0],
                    deliverOrderTotal: deliverOrderTotal,
                    orderTotal: warehouse.length,
                    pickupOrderTotal: pickupOrderTotal,
                });
            });

            return orderByAreas;
        } else {
            // Admin
            warehouseIdList = Array.from(new Set<number>(warehouses.map((element) => element.warehouse_warehouse_id)));

            warehouseIdList.forEach((warehouseId) => {
                const warehouse = warehouses.filter((element) => element.warehouse_warehouse_id === warehouseId);
                const deliverOrderTotal = warehouses
                    .filter((element) => element.warehouse_warehouse_id === warehouseId)
                    .filter((element) => element.pickupOrders_order_id !== null).length;
                const pickupOrderTotal = warehouses
                    .filter((element) => element.warehouse_warehouse_id === warehouseId)
                    .filter((element) => element.deliverOrders_order_id !== null).length;

                orderByAreas.push({
                    warehouseName: warehouse.map((element) => element.warehouse_warehouse_name)[0],
                    deliverOrderTotal: deliverOrderTotal,
                    orderTotal: warehouse.length,
                    pickupOrderTotal: pickupOrderTotal,
                });
            });

            return orderByAreas;
        }
    }

    private async calculationAdminRevenueTotal() {
        return await this.orderRepository.sum('estimatedPrice', { orderStt: 8 });
    }

    private async calculationRevenuePickup(warehouseIdList: number[], from?: string, to?: string): Promise<number> {
        from = from ? from : this.getCurrentMonth().from;
        to = to ? to : this.getCurrentMonth().to;

        const pickup: any = await this.warehouseRepository
            .createQueryBuilder('warehouse')
            .innerJoinAndSelect(StaffEntity, 'staff', 'warehouse.warehouse_id = staff.warehouse_id')
            .innerJoinAndMapMany('warehouse.orders', OrderEntity, 'orders', 'staff.staff_id = orders.pickup_shipper')
            .where('warehouse.warehouse_id IN (:...warehouseIdList)', { warehouseIdList: warehouseIdList })
            .andWhere('orders.date_update_at between :from and :to', { from: from, to: to })
            .andWhere('warehouse.isActive = :isActive', { isActive: true })
            .getOne();

        let revenue: number = 0;
        if (pickup && pickup.orders) {
            const orders: any = pickup.orders;
            orders.forEach((element) => {
                revenue += (element.estimatedPrice / 100) * 40;
            });
        }

        return revenue;
    }

    private async calculationRevenueDeliver(warehouseIdList: number[], from?: string, to?: string): Promise<number> {
        from = from ? from : this.getCurrentMonth().from;
        to = to ? to : this.getCurrentMonth().to;

        const deliver: any = await this.warehouseRepository
            .createQueryBuilder('warehouse')
            .innerJoinAndSelect(StaffEntity, 'staff', 'warehouse.warehouse_id = staff.warehouse_id')
            .innerJoinAndMapMany('warehouse.orders', OrderEntity, 'orders', 'staff.staff_id = orders.deliver_shipper')
            .where('warehouse.warehouse_id IN (:...warehouseIdList)', { warehouseIdList: warehouseIdList })
            .andWhere('orders.date_update_at between :from and :to', { from: from, to: to })
            .andWhere('warehouse.isActive = :isActive', { isActive: true })
            .getOne();

        let revenue: number = 0;
        if (deliver && deliver.orders) {
            const orders: any = deliver.orders;
            orders.forEach((element) => {
                revenue += (element.estimatedPrice / 100) * 60;
            });
        }

        return revenue;
    }

    private async calculationOrderTotal(warehouseIdList?: number[], from?: string, to?: string): Promise<number> {
        from = from ? from : this.getCurrentMonth().from;
        to = to ? to : this.getCurrentMonth().to;
        let orderTotal: number = 0;

        if (warehouseIdList) {
            const warehouse: any = await this.warehouseRepository
                .createQueryBuilder('warehouse')
                .innerJoinAndMapMany(
                    'warehouse.staffs',
                    StaffEntity,
                    'staffs',
                    'warehouse.warehouse_id = staffs.warehouse_id',
                )
                .where('warehouse.warehouse_id IN (:...warehouseIdList)', { warehouseIdList: warehouseIdList })
                .andWhere('warehouse.isActive = :isActive', { isActive: true })
                .getOne();

            if (warehouse) {
                if (warehouse.staffs) {
                    const staffIds = warehouse.staffs.map((element) => element.staffId);

                    orderTotal += await this.orderRepository
                        .createQueryBuilder('order')
                        .where(
                            new Brackets((qb) => {
                                qb.where('order.pickup_shipper IN (:...staffIds)', {
                                    staffIds: staffIds,
                                }).orWhere('order.deliver_shipper IN (:...staffIds)', {
                                    staffIds: staffIds,
                                });
                            }),
                        )
                        .andWhere('order.date_update_at between :from and :to', { from: from, to: to })
                        .getCount();
                }
            }
        }

        return orderTotal;
    }

    private async calculationStaffTotal(warehouseIdList?: number[]): Promise<number> {
        let staffTotal: number = 0;

        if (warehouseIdList) {
            staffTotal += await this.staffRepository
                .createQueryBuilder('staffs')
                .innerJoinAndSelect(WarehouseEntity, 'warehouse', 'warehouse.warehouse_id = staffs.warehouse_id')
                .where('warehouse.warehouse_id IN (:...warehouseIdList)', { warehouseIdList: warehouseIdList })
                .getCount();
        } else {
            staffTotal += await this.staffRepository.count();
        }

        return staffTotal;
    }

    private toAdminReportDashboard(revenueTotal: number, orderTotal: number, staffTotal: number): ReportDashboard {
        return Builder<ReportDashboard>()
            .revenueTotal(revenueTotal)
            .customerTotal(0)
            .orderTotal(orderTotal)
            .staffTotal(staffTotal)
            .warehouseTotal(0)
            .areaTotal(0)
            .build();
    }

    private toManagerReportDashboard(revenueTotal: number, orderTotal: number, staffTotal: number): ReportDashboard {
        return Builder<ReportDashboard>()
            .revenueTotal(revenueTotal)
            .orderTotal(orderTotal)
            .staffTotal(staffTotal)
            .build();
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

    private getCurrentMonth() {
        const from = moment().startOf('month').format('YYYY-MM-DD');
        const to = moment().endOf('month').format('YYYY-MM-DD');

        return { from: from, to: to };
    }
}
