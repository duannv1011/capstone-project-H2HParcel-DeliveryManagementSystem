import { Injectable } from '@nestjs/common';
import { RevenueByArea, RevenueByWarehouse, orderCountByMonth, revanueByMonth } from './response/report.response';
import { StaffEntity } from '../../../entities/staff.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WarehouseEntity } from '../../../entities/warehouse.entity';
import { OrderEntity } from '../../../entities/order.entity';
import { DistrictEntity } from '../../../entities/district.entity';
import * as _ from 'lodash';
import { AccountEntity } from 'src/entities/account.entity';
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
    async reportAdminRevenueByWarehoueInMotnhfortable(month: number, pageNo: number) {
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
        const pageSize = this.pageSize;
        pageNo = pageNo ? Math.floor(Math.abs(pageNo)) : 1;
        const startIndex = (pageNo - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const totalpages =
            sortedWarehouses.length % pageSize === 0
                ? sortedWarehouses.length / pageSize
                : Math.floor(sortedWarehouses.length / pageSize) + 1;
        // Get the paged data
        const pagedWarehouses = sortedWarehouses.slice(startIndex, endIndex);

        return {
            data: pagedWarehouses,
            pageno: pageNo,
            totalPage: totalpages,
        };
    }
    async reportCutomerAdminForGraph() {
        const currentYear = new Date().getFullYear(); // Get the current year
        const dataquery = await this.orderRepository
            .createQueryBuilder('o')
            .select('EXTRACT(MONTH FROM o.date_create_at) as month')
            .addSelect('COUNT(DISTINCT o.cus_id) as customerCount')
            .andWhere('EXTRACT(YEAR FROM o.date_create_at) = :year', { year: currentYear.toString() })
            .groupBy('EXTRACT(MONTH FROM o.date_create_at)')
            .orderBy('month', 'ASC')
            .getRawMany();
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const countByMonth: revanueByMonth[] = Array.from({ length: currentMonth }, (_, i) => ({
            month: i + 1,
            totalRevenue: '0',
        }));
        dataquery.forEach((data) => {
            countByMonth[Number(data.month) - 1].totalRevenue = data.customercount;
        });
        return countByMonth;
    }
    async reportAdminRevenueByDitrictInMotnhfortable(month: number, pageNo: number) {
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
            .leftJoinAndSelect('piww.address', 'piwwa')
            .leftJoinAndSelect('diww.address', 'diwwa')
            .select([
                'EXTRACT(MONTH FROM o.date_update_at) AS curuntMonth',
                'o.order_id',
                'piw.warehouse_id AS pickupWarehouse',
                '(o.estimated_price * 0.4) AS pickupWarehouseRevanue',
                'piwwa.district_id as pickupDistrict',
                'diw.warehouse_id AS deliverWarehouse',
                '(o.estimated_price * 0.6) AS deliverWarehouseRevanue',
                'diwwa.district_id as deliverDistrict',
            ])
            .where('o.order_stt = :stt', { stt: 9 })
            .andWhere('EXTRACT(MONTH FROM o.date_update_at) = :month', { month: month.toString() })
            .andWhere('EXTRACT(YEAR FROM o.date_update_at) = :year', { year: currentYear.toString() })
            .getRawMany();
        const data: RevenueByArea[] = [];

        dataQuery.forEach((item) => {
            const pickupData: RevenueByArea = {
                date: item.o_date_update_at,
                currentMonth: item.curuntmonth,
                warehouseId: item.pickupwarehouse,
                districtId: item.pickupdistrict,
                revenue: Number(item.pickupwarehouserevanue),
            };

            const deliverData: RevenueByArea = {
                date: item.o_date_update_at,
                currentMonth: item.curuntmonth,
                warehouseId: item.deliverwarehouse,
                districtId: item.deliverdistrict,
                revenue: Number(item.deliverwarehouserevanue),
            };
            data.push(pickupData, deliverData);
        });
        const AreMap = _.groupBy(data, 'districtId');
        const result = [];
        for (const [key, value] of Object.entries(AreMap)) {
            result.push({
                districtId: Number(key),
                revenue: _.sumBy(value, 'revenue'),
            });
        }
        const districts = await this.districtRepository
            .createQueryBuilder('d')
            .select(['d.district_id', 'd.district_name', '0 AS revenue'])
            .getRawMany();

        const mergedArea = districts.map((district) => {
            const found = result.find(({ districtId }) => districtId === district.district_id);
            return {
                districtId: district.district_id,
                warehouseName: district.district_name,
                revenue: found ? found.revenue : 0,
            };
        });
        const sortedArea = mergedArea.sort((a, b) => b.revenue - a.revenue);
        const pageSize = this.pageSize;
        pageNo = pageNo ? Math.floor(Math.abs(pageNo)) : 1;
        const startIndex = (pageNo - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const totalpages =
            sortedArea.length % pageSize === 0
                ? sortedArea.length / pageSize
                : Math.floor(sortedArea.length / pageSize) + 1;
        // Get the paged data
        const pagedWarehouses = sortedArea.slice(startIndex, endIndex);

        return {
            data: pagedWarehouses,
            pageno: pageNo,
            totalPage: totalpages,
            count: sortedArea.length,
        };
    }
    async reportCutomerAdminForTable(pageNo: number, month: number) {
        const currentYear = new Date().getFullYear(); // Get the current year
        const dataQuery = await this.orderRepository
            .createQueryBuilder('o')
            .leftJoinAndSelect('o.customer', 'c')
            .leftJoinAndSelect('c.address', 'a')
            .leftJoinAndSelect('a.district', 'd')
            .select(['a.district_id', 'd.district_name', 'COUNT(DISTINCT o.cus_id) as customer_count'])
            .where('EXTRACT(YEAR FROM o.date_update_at) = :year', { year: currentYear.toString() })
            .andWhere('EXTRACT(MONTH FROM o.date_update_at) = :month', { month: month.toString() })
            .groupBy('a.district_id,d.district_name')
            .getRawMany();
        const district = await this.districtRepository.find();
        const mergedDistrict = district.map((district) => {
            const found = dataQuery.find(({ district_id }) => district_id === district.districtId);
            return {
                districtId: district.districtId,
                districtName: district.districtName,
                customerCount: found ? Number(found.customer_count) : 0,
            };
        });
        const sortedData = mergedDistrict.sort((a, b) => b.customerCount - a.customerCount);

        const pageSize = this.pageSize;
        pageNo = pageNo ? Math.floor(Math.abs(pageNo)) : 1;
        const startIndex = (pageNo - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const totalpages =
            sortedData.length % pageSize === 0
                ? sortedData.length / pageSize
                : Math.floor(sortedData.length / pageSize) + 1;
        // Get the paged data
        const ressult = sortedData.slice(startIndex, endIndex);

        return {
            data: ressult,
            pageno: pageNo,
            totalPage: totalpages,
        };
    }

    async reportOrderAdminforGraph() {
        const currentYear = new Date().getFullYear(); // Get the current year
        const dataquery = await this.orderRepository
            .createQueryBuilder('o')
            .select('EXTRACT(MONTH FROM o.date_update_at) AS month')
            .addSelect('COUNT(DISTINCT o.order_id) as orderCount')
            .where('o.order_stt = :stt', { stt: 9 })
            .andWhere('EXTRACT(YEAR FROM o.date_update_at) = :year', { year: currentYear.toString() })
            .groupBy('EXTRACT(MONTH FROM o.date_update_at)')
            .getRawMany();
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const orderCountByMonth: orderCountByMonth[] = Array.from({ length: currentMonth }, (_, i) => ({
            month: i + 1,
            totalOrder: 0,
        }));
        dataquery.forEach((data) => {
            orderCountByMonth[Number(data.month) - 1].totalOrder = Number(data.ordercount);
        });
        return orderCountByMonth;
    }
    async reportOrderByWarehoueInMotnhfortable(month: number, pageNo: number) {
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
                'EXTRACT(MONTH FROM o.date_update_at) AS curuntMonth',
                'o.order_id',
                'piw.warehouse_id AS pickupWarehouse',
                'piww.warehouse_name AS pickupWarehouseName',
                'diw.warehouse_id AS deliverWarehouse',
                'diww.warehouse_name AS deliverWarehouseName',
            ])
            .where('o.order_stt = :stt', { stt: 9 })
            .andWhere('EXTRACT(MONTH FROM o.date_update_at) = :month', { month: month.toString() })
            .andWhere('EXTRACT(YEAR FROM o.date_update_at) = :year', { year: currentYear.toString() })
            .getRawMany();
        const data: any = [];

        dataQuery.forEach((item) => {
            const pickupData: any = {
                currentMonth: item.curuntmonth,
                warehouseId: item.pickupwarehouse,
                warehouseName: item.pickupwarehousename,
                type: 'pickup',
            };

            const deliverData: any = {
                currentMonth: item.curuntmonth,
                warehouseId: item.deliverwarehouse,
                warehouseName: item.deliverwarehousename,
                type: 'deliver',
            };
            data.push(pickupData, deliverData);
        });
        const warehouseMap = _.groupBy(data, 'warehouseId');
        const result = [];
        for (const [key, value] of Object.entries(warehouseMap)) {
            const count = _.countBy(value, 'type');
            result.push({
                warehouseId: Number(key),
                warehouseName: value[0].warehouseName,
                totalPickupOrder: count.pickup || 0,
                totalDeliverOrder: count.deliver || 0,
            });
        }
        const warehouses = await this.warehouseRepository
            .createQueryBuilder('w')
            .select(['w.warehouseId', 'w.warehouseName', '0 AS totalPickupOrder', '0 AS totalDeliverOrder'])
            .getRawMany();

        const mergedWarehouses = warehouses.map((warehouse) => {
            const found = result.find(({ warehouseId }) => warehouseId === warehouse.w_warehouse_id);
            return {
                warehouseId: warehouse.w_warehouse_id,
                warehouseName: warehouse.w_warehouse_name,
                totalPickupOrder: found ? found.totalPickupOrder : 0,
                totalDeliverOrder: found ? found.totalDeliverOrder : 0,
                totalOrder: found ? found.totalPickupOrder + found.totalDeliverOrder : 0,
            };
        });
        const sortedWarehouses = mergedWarehouses.sort((a, b) => b.totalOrder - a.totalOrder);
        const pageSize = this.pageSize;
        pageNo = pageNo ? Math.floor(Math.abs(pageNo)) : 1;
        const startIndex = (pageNo - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const totalpages =
            sortedWarehouses.length % pageSize === 0
                ? sortedWarehouses.length / pageSize
                : Math.floor(sortedWarehouses.length / pageSize) + 1;
        if (pageNo > totalpages) {
            return { status: 404, error: 'notfoud' };
        }
        // Get the paged data
        const pagedWarehouses = sortedWarehouses.slice(startIndex, endIndex);

        return {
            data: pagedWarehouses,
            pageno: pageNo,
            totalPage: totalpages,
            count: sortedWarehouses.length,
        };
    }
    async reportOrderStaffByWarehoueInMotnhfortable(month: number, pageNo: number) {
        const currentYear = new Date().getFullYear(); // Get the current year
        const dataQuery = await this.orderRepository
            .createQueryBuilder('o')
            .leftJoinAndSelect('o.pickupShipperStaff', 'pi')
            .leftJoinAndSelect('o.deliverShipperStaff', 'di')
            .leftJoinAndSelect('pi.warehouse', 'piw')
            .leftJoinAndSelect('di.warehouse', 'diw')
            .select([
                'EXTRACT(MONTH FROM o.date_update_at) AS curuntMonth',
                'o.order_id as orderId',
                'pi.staff_id as pickupStaffId',
                'pi.fullname as pickupstaffName',
                'di.staff_id as deliverStaffId',
                'di.fullname as deliverstaffName',
                'piw.warehouse_id AS pickupWarehouse',
                'piw.warehouse_name AS pickupWarehouseName',
                'diw.warehouse_id AS deliverWarehouse',
                'diw.warehouse_name AS deliverWarehouseName',
            ])
            .where('o.order_stt = :stt', { stt: 9 })
            .andWhere('EXTRACT(MONTH FROM o.date_update_at) = :month', { month: month.toString() })
            .andWhere('EXTRACT(YEAR FROM o.date_update_at) = :year', { year: currentYear.toString() })
            .getRawMany();
        const data: any = [];

        dataQuery.forEach((item) => {
            const pickupData: any = {
                currentMonth: item.curuntmonth,
                staffId: item.pickupstaffid,
                staffName: item.pickupstaffname,
                warehouseId: item.pickupwarehouse,
                warehouseName: item.pickupwarehousename,
                type: 'pickup',
            };

            const deliverData: any = {
                currentMonth: item.curuntmonth,
                staffId: item.deliverstaffid,
                staffName: item.deliverstaffname,
                warehouseId: item.deliverwarehouse,
                warehouseName: item.deliverwarehousename,
                type: 'deliver',
            };
            data.push(pickupData, deliverData);
        });
        const staffMap = _.groupBy(data, 'staffId');
        const result = [];
        for (const [key, value] of Object.entries(staffMap)) {
            const count = _.countBy(value, 'type');
            result.push({
                staffId: Number(key),
                staffname: value[0].staffName,
                warehouseId: value[0].warehouseId,
                warehouseName: value[0].warehouseName,
                totalPickupOrder: count.pickup || 0,
                totalDeliverOrder: count.deliver || 0,
            });
        }
        const staffs = await this.staffRepository
            .createQueryBuilder('s')
            .leftJoinAndSelect('s.warehouse', 'w')
            .leftJoinAndSelect(AccountEntity, 'acc', 'acc.acc_id = s.acc_id')
            .select(['s.staff_id', 's.fullname', 'w.warehouse_id', 'w.warehouse_name', 'acc.role_id'])
            .where('acc.role_id = :roleId', { roleId: 2 })
            .getRawMany();
        const mergedStaffs = staffs.map((staff) => {
            const found = result.find(({ staffId }) => staffId === staff.staff_id);
            return {
                staffId: staff.staff_id,
                staffName: staff.s_fullname,
                warehouseId: staff.warehouse_id,
                warehouseName: staff.warehouse_name,
                totalPickupOrder: found ? found.totalPickupOrder : 0,
                totalDeliverOrder: found ? found.totalDeliverOrder : 0,
                totalOrder: found ? found.totalPickupOrder + found.totalDeliverOrder : 0,
            };
        });
        const sortedStaff = mergedStaffs.sort((a, b) => b.totalOrder - a.totalOrder);
        const pageSize = this.pageSize;
        pageNo = pageNo ? Math.floor(Math.abs(pageNo)) : 1;
        const startIndex = (pageNo - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const totalpages =
            sortedStaff.length % pageSize === 0
                ? sortedStaff.length / pageSize
                : Math.floor(sortedStaff.length / pageSize) + 1;
        if (pageNo > totalpages) {
            return { status: 404, error: 'notfoud' };
        }
        // Get the paged data
        const pageStaff = sortedStaff.slice(startIndex, endIndex);

        return {
            data: pageStaff,
            pageno: pageNo,
            totalPage: totalpages,
            count: sortedStaff.length,
        };
    }
    ////////////////////////////////////////////////////
}
