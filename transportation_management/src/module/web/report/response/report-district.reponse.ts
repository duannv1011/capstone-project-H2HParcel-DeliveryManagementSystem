import { Paging } from '../../../response/Paging';

export class ReportDistrictResponse {
    report: ReportDistrict;
    paging: Paging;
}

export interface ReportDistrict {
    reportChart: any;
    totalCustomer: number;
    districts: District[];
}

export interface District {
    districtId: string;
    districtName: string;
    totalCustomer: number;
}
