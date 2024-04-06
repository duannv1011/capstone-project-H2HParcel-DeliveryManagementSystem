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
    report: ReportOrderDetail;
    paging: Paging;
}

export interface ReportOrderDetail {
    reportChart: any;
    orderByArea: OrderByArea[];
    orderTotal: number;
}

export interface OrderByArea {
    warehouseName: string;
    pickupOrderTotal: number;
    deliverOrderTotal: number;
    orderTotal: number;
}
