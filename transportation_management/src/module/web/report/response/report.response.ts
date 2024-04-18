import { Paging } from '../../../response/Paging';

export interface ReportDashboardResponse {
    reportDashboard: ReportDashboard;
}

export interface ReportDashboard {
    revenueTotal: number;
    customerTotal: number;
    orderTotal: number;
    staffTotal: number;
    warehouseTotal: number;
    areaTotal: number;
}

export interface ReportOrderDetailResponse {
    report: any;
    paging: Paging;
}
export interface revanueByMonth {
    month: number;
    totalRevenue: string;
}
export interface orderCountByMonth {
    month: number;
    totalOrder: number;
}
export interface ReportOrderDetail {
    reportChart: any;
    warehouses: any;
}
export interface RevenueByWarehouse {
    date: string;
    currentMonth: string;
    warehouseId: number;
    warehouseName: string;
    revenue: number;
}

export interface OrderByArea {
    warehouseName: string;
    pickupOrderTotal: number;
    deliverOrderTotal: number;
    orderTotal: number;
}
