import { Paging } from '../../../response/Paging';

export class ReportWarehouseResponse {
    report: ReportWarehouse;
    paging: Paging;
}

export interface ReportWarehouse {
    reportChart: any;
    warehouses: Warehouse[];
}

export interface Warehouse {
    warehouseId: number;
    warehouseName: string;
    totalRevenue: number;
}
