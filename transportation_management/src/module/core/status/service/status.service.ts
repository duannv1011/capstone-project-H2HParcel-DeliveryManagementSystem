import { Injectable } from '@nestjs/common';
@Injectable()
export class StatusService {
    async getAllCustomerStatus(): Promise<any> {
        const statusData = [
            { stt_id: 1, statusName: 'active' },
            { stt_id: 2, statusName: 'suspend' },
            { stt_id: 3, statusName: 'blocked' },
        ];
        return statusData;
    }
    async getAllStaffStatus() {
        const statusData = [
            { stt_id: 1, statusName: 'working' },
            { stt_id: 2, statusName: '' },
            { stt_id: 3, statusName: '' },
        ];
        return statusData;
    }
}
