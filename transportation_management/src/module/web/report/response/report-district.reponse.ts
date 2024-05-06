import { Paging } from '../../../response/Paging';

export class ReportDistrictResponse {
    report: ReportDistrict;
    paging: Paging;
}

export interface ReportDistrict {
    districts: District[];
}

export interface District {
    districtId: string;
    districtName: string;
    totalRevenue: number;
}
