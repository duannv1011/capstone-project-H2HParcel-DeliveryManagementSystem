import { Paging } from '../../../response/Paging';

export interface ReportStaffResponse {
    reports: ReportStaff[];
    paging: Paging;
}

export interface ReportStaff {
    staffId: number;
    staffName: string;
    warehouseName: string;
    totalOrder: number;
    revenue: number;
}
