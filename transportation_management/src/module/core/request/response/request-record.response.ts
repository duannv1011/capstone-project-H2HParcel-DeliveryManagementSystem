import { Paging } from '../../../response/Paging';

export interface RequestRecordResponse {
    records: RequestRecord[];
    paging: Paging;
}

export interface RequestTransitRecordResponse {
    records: RequestTransitRecord[];
    paging: Paging;
}

export interface RequestRecordDetailResponse {
    record: RequestRecord;
}

export interface RequestRecord {
    requestRecordId: number;
    requestId: number;
    orderId: number;
    deliverName: string;
    requestType: string;
    requestStatus: string;
    note: string;
}

export interface RequestTransitRecord {
    requestRecordId: number;
    requestId: number;
    requestType: string;
    requestStatus: string;
    note: string;
}

export interface Transit {
    warehouseFrom: number;
    warehouseTo: number;
}
