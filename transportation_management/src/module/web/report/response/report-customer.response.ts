import { Paging } from '../../../response/Paging';

export class ReportCustomerResponse {
    report: ReportCustomer;
    paging: Paging;
}

export interface ReportCustomer {
    reportChart: any;
    customers: Customer[];
}

export interface Customer {
    wardName: string;
    totalCustomer: number;
}
